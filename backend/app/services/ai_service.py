import re
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import ComplaintModel
from app.graph.workflow import run_complaint_analysis
from app.schemas.complaint import (
    RiskAssessmentResponseSchema,
    CompletenessResponseSchema,
    DuplicateCheckResponseSchema
)

async def analyze_complaint_service(db: AsyncSession, content: str, source_type: str = "TEXT") -> Dict[str, Any]:
    result = await db.execute(select(ComplaintModel))
    existing = result.scalars().all()
    existing_list = [
        {
            "complaint_number": c.complaint_number,
            "batch_number": c.batch_number,
            "product_name_raw": c.product_name,
            "complaint_category": c.complaint_category,
            "defect_description": c.complaint_description,
            "customer_name": c.customer_name,
            "market": c.market
        }
        for c in existing
    ]

    graph_result = await run_complaint_analysis(
        raw_text=content,
        input_type=source_type,
        existing_complaints=existing_list
    )

    return graph_result

def calculate_risk_assessment(
    product_name: Optional[str],
    product_type: str,
    severity_str: str,
    defect_description: str,
    adverse_event: bool = False
) -> RiskAssessmentResponseSchema:
    sev_upper = (severity_str or "MINOR").upper()
    if sev_upper not in ["MINOR", "MAJOR", "CRITICAL"]:
        sev_upper = "MINOR"

    sev_score = 5 if sev_upper == "CRITICAL" or adverse_event else (3 if sev_upper == "MAJOR" else 2)
    prob_score = 4 if adverse_event else 2
    det_score = 3 if product_type == "FDF" else 2
    rpn = sev_score * prob_score * det_score
    
    if sev_upper == "CRITICAL" or adverse_event or rpn >= 40:
        risk_lvl = "CRITICAL"
    elif rpn >= 24:
        risk_lvl = "HIGH"
    elif rpn >= 12:
        risk_lvl = "MEDIUM"
    else:
        risk_lvl = "LOW"

    prob_enum = "FREQUENT" if prob_score == 5 else ("LIKELY" if prob_score == 4 else ("POSSIBLE" if prob_score == 3 else ("UNLIKELY" if prob_score == 2 else "RARE")))
    det_enum = "LOW" if det_score == 3 else ("MEDIUM" if det_score == 2 else "HIGH")

    reportable = sev_upper == "CRITICAL" or adverse_event or (product_type == "API" and "impurity" in (defect_description or "").lower())

    risk_factors = []
    if adverse_event:
        risk_factors.append("Adverse Event Reported")
    if sev_upper == "CRITICAL":
        risk_factors.append("Critical Sterility / Patient Safety Defect")
    if product_type == "API":
        risk_factors.append("API Raw Material Discrepancy")
    if reportable:
        risk_factors.append("FDA 15-Day Reportable")

    reasoning = (
        f"ICH Q9 Quality Risk Assessment determined overall risk level as {risk_lvl} "
        f"with Severity={sev_upper}, Probability={prob_enum}, and Detectability={det_enum}. "
        f"Defect description indicates impact on {product_name or 'pharmaceutical batch'} release specifications."
    )

    action = (
        "Quarantine affected batch immediately across all warehouses and initiate 24-hour Site QA containment review."
        if risk_lvl in ["CRITICAL", "HIGH"]
        else "Initiate standard investigation and conduct lab retain sample testing."
    )

    return RiskAssessmentResponseSchema(
        risk_level=risk_lvl,
        severity=sev_upper,
        probability=prob_enum,
        detectability=det_enum,
        reasoning=reasoning,
        recommended_action=action,
        key_risk_factors=risk_factors,
        severity_score=sev_score,
        probability_score=prob_score,
        detectability_score=det_score,
        rpn_score=rpn,
        patient_safety_impact=f"Patient safety risk evaluated as {risk_lvl}. Adverse event flag: {adverse_event}.",
        quality_impact=f"Defect affects release specification for {product_name or 'pharmaceutical product'}.",
        regulatory_reportable=reportable,
        justification=f"ICH Q9 RPN Score = {rpn} (Severity {sev_score} x Probability {prob_score} x Detectability {det_score})."
    )

def evaluate_completeness(data: Dict[str, Any]) -> CompletenessResponseSchema:
    fields_to_check = {
        "product_name": "Product Name",
        "batch_number": "Batch / Lot Number",
        "complaint_description": "Complaint Description",
        "quantity_affected": "Quantity Affected",
        "customer_name": "Customer / Reporter Name",
        "market": "Market / Jurisdiction",
        "complaint_received_date": "Dates (Received / Observation)",
        "adverse_event": "Adverse Event Information"
    }

    missing = []
    warnings = []
    questions = []
    present_count = 0
    total = len(fields_to_check)

    for field, label in fields_to_check.items():
        val = data.get(field)
        if field == "adverse_event":
            # If adverse_event is None or missing explicitly
            if val is None:
                missing.append(field)
                warnings.append("Adverse event status is unconfirmed.")
                questions.append("Was any patient harm, adverse drug reaction, or medical intervention reported?")
            else:
                present_count += 1
        elif not val or str(val).strip().lower() in ["null", "none", "unknown", "reported customer", "commercial market", "hospital / commercial", "commercial", ""]:
            missing.append(field)
            if field == "batch_number":
                warnings.append("Missing Batch / Lot Number prevents direct manufacturing execution record traceability.")
                questions.append("Can you provide the exact Lot/Batch number printed on the drum, carton, or blister pack?")
            elif field == "product_name":
                warnings.append("Product identification is incomplete.")
                questions.append("What is the exact commercial brand name or active drug substance code?")
            elif field == "quantity_affected":
                warnings.append("Affected quantity is unspecified.")
                questions.append("How many units, cartons, or kilograms of material were affected by this defect?")
            elif field == "market":
                warnings.append("Market / Jurisdiction is missing.")
                questions.append("Which country or health authority jurisdiction received the affected product shipment?")
            elif field == "complaint_received_date":
                questions.append("What date was the defect first observed or received by your QA team?")
            elif field == "customer_name":
                questions.append("What is the primary contact name, title, and organization reporting this issue?")
        else:
            present_count += 1

    score = int((present_count / total) * 100)
    is_complete = len(missing) == 0

    return CompletenessResponseSchema(
        is_complete=is_complete,
        completeness_percentage=score,
        missing_fields=missing,
        warnings=warnings,
        suggested_follow_up_questions=questions
    )

async def check_duplicates(
    db: AsyncSession,
    batch_number: Optional[str] = None,
    product_name: Optional[str] = None,
    complaint_category: Optional[str] = None,
    defect_description: Optional[str] = None,
    customer_name: Optional[str] = None,
    market: Optional[str] = None
) -> DuplicateCheckResponseSchema:
    result = await db.execute(select(ComplaintModel))
    existing = result.scalars().all()

    matching_ids = []
    reasoning = "No duplicate batch or defect pattern detected."
    confidence = 0.0
    is_match = False

    if batch_number:
        clean_batch = batch_number.strip().lower()
        for c in existing:
            if c.batch_number and c.batch_number.strip().lower() == clean_batch:
                matching_ids.append(c.complaint_number)
                is_match = True
                confidence = 0.95
                reasoning = f"Matching Batch / Lot number '{batch_number}' found in existing complaint record(s): {', '.join(matching_ids)}."

    if not is_match and product_name and defect_description:
        prod_lower = product_name.strip().lower()
        desc_lower = defect_description.strip().lower()
        for c in existing:
            if c.product_name and prod_lower in c.product_name.strip().lower():
                keywords = ["dissolution", "discoloration", "seal", "speck", "particle", "leak", "potency", "broken", "impurity"]
                shared = [kw for kw in keywords if kw in desc_lower and c.complaint_description and kw in c.complaint_description.lower()]
                if len(shared) >= 2:
                    matching_ids.append(c.complaint_number)
                    is_match = True
                    confidence = 0.78
                    reasoning = f"Similar quality defect pattern ({', '.join(shared)}) identified in existing complaint {c.complaint_number} for product {product_name}."

    return DuplicateCheckResponseSchema(
        possible_duplicate=is_match,
        matching_complaint_ids=matching_ids,
        similarity_reasoning=reasoning,
        confidence=confidence,
        is_potential_duplicate=is_match,
        duplicate_of_number=matching_ids[0] if matching_ids else None,
        similarity_score=confidence,
        duplicate_reason=reasoning
    )
