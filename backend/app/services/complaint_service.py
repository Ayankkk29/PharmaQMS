import datetime
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException

from app.db.models import ComplaintModel
from app.schemas.complaint import ComplaintCreateSchema, ComplaintUpdateSchema
from app.services.ai_service import evaluate_completeness, check_duplicates

async def create_complaint(db: AsyncSession, schema: ComplaintCreateSchema) -> ComplaintModel:
    # Auto-generate unique complaint number (e.g. CMP-2026-0005)
    count_res = await db.execute(select(ComplaintModel))
    all_complaints = count_res.scalars().all()
    next_num = len(all_complaints) + 1
    cmp_number = f"CMP-2026-{next_num:04d}"

    prod_name = schema.product_name or schema.product_name_raw
    customer = schema.customer_name or schema.reporter_name or schema.reporter_organization
    category = schema.complaint_category or schema.defect_category
    desc = schema.complaint_description or schema.defect_description or schema.raw_content or "No detailed description provided."

    # Evaluate completeness & duplicate status
    comp_eval = evaluate_completeness({
        "product_name": prod_name,
        "batch_number": schema.batch_number,
        "customer_name": customer,
        "complaint_description": desc,
        "complaint_received_date": schema.complaint_received_date
    })

    dup_eval = await check_duplicates(
        db,
        batch_number=schema.batch_number,
        product_name=prod_name,
        defect_description=desc
    )

    new_complaint = ComplaintModel(
        complaint_number=cmp_number,
        product_name=prod_name,
        product_code=schema.product_code,
        batch_number=schema.batch_number,
        dosage_form=schema.dosage_form,
        strength=schema.strength,
        manufacturing_date=schema.manufacturing_date,
        expiry_date=schema.expiry_date,
        complaint_received_date=schema.complaint_received_date or datetime.date.today().isoformat(),
        customer_name=customer,
        market=schema.market,
        country=schema.country,
        complaint_category=category,
        complaint_description=desc,
        quantity_affected=schema.quantity_affected,
        adverse_event=schema.adverse_event,
        quality_issue=schema.quality_issue,
        initial_assessment=schema.initial_assessment,
        severity=schema.severity,
        probability=schema.probability,
        detectability=schema.detectability,
        risk_level=schema.risk_level,
        investigation_recommendation=schema.investigation_recommendation,
        capa_recommendation=schema.capa_recommendation,
        status=schema.status,
        source_type=schema.source_type,
        raw_content=schema.raw_content or desc,
        is_complete=comp_eval.is_complete,
        missing_fields=comp_eval.missing_fields,
        is_potential_duplicate=dup_eval.is_potential_duplicate,
        duplicate_of_number=dup_eval.duplicate_of_number,
        duplicate_reason=dup_eval.duplicate_reason
    )

    db.add(new_complaint)
    await db.commit()
    await db.refresh(new_complaint)
    return new_complaint

async def get_complaints(
    db: AsyncSession,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    product_code: Optional[str] = None
) -> List[ComplaintModel]:
    query = select(ComplaintModel).order_by(ComplaintModel.created_at.desc())
    if status:
        query = query.where(ComplaintModel.status == status)
    if severity:
        query = query.where(ComplaintModel.severity == severity)
    if product_code:
        query = query.where(ComplaintModel.product_code == product_code)

    result = await db.execute(query)
    return result.scalars().all()

async def get_complaint_by_id(db: AsyncSession, complaint_id: str) -> ComplaintModel:
    query = select(ComplaintModel).where(
        (ComplaintModel.complaint_id == complaint_id) | (ComplaintModel.complaint_number == complaint_id)
    )
    result = await db.execute(query)
    complaint = result.scalars().first()
    if not complaint:
        raise HTTPException(status_code=404, detail=f"Complaint '{complaint_id}' not found.")
    return complaint

async def update_complaint(db: AsyncSession, complaint_id: str, schema: ComplaintUpdateSchema) -> ComplaintModel:
    complaint = await get_complaint_by_id(db, complaint_id)

    update_data = schema.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(complaint, field, val)

    complaint.updated_at = datetime.datetime.utcnow()

    # Re-evaluate completeness
    comp_eval = evaluate_completeness({
        "product_name": complaint.product_name,
        "batch_number": complaint.batch_number,
        "customer_name": complaint.customer_name,
        "complaint_description": complaint.complaint_description,
        "complaint_received_date": complaint.complaint_received_date
    })
    complaint.is_complete = comp_eval.is_complete
    complaint.missing_fields = comp_eval.missing_fields

    await db.commit()
    await db.refresh(complaint)
    return complaint
