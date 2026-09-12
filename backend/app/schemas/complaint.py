import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ProductSchema(BaseModel):
    id: str
    product_code: str
    product_name: str
    type: str
    dosage_form: Optional[str] = None
    manufacturer_site: Optional[str] = None

class ExtractedComplaintInfo(BaseModel):
    product_name: Optional[str] = Field(None, description="Name of the pharmaceutical product or API")
    product_type: str = Field("FDF", description="API or FDF")
    batch_number: Optional[str] = Field(None, description="Lot or Batch number")
    reporter_name: Optional[str] = Field(None, description="Name of complainant/reporter")
    reporter_contact: Optional[str] = Field(None, description="Email or phone of reporter")
    reporter_organization: Optional[str] = Field(None, description="Hospital, pharmacy, distributor, or customer name")
    complaint_date: Optional[str] = Field(None, description="Date complaint was received (YYYY-MM-DD)")
    event_date: Optional[str] = Field(None, description="Date defect was observed (YYYY-MM-DD)")
    defect_category: Optional[str] = Field(None, description="Category e.g. Contamination, Packaging, Potency, Discoloration")
    defect_description: str = Field("", description="Detailed description of defect")
    severity: str = Field("MINOR", description="CRITICAL, MAJOR, or MINOR")
    market: Optional[str] = Field(None, description="Market / Jurisdiction")
    quantity_affected: Optional[str] = Field(None, description="Quantity affected")
    adverse_event: bool = Field(False, description="Adverse event status")

class CompletenessInfo(BaseModel):
    is_complete: bool
    completeness_percentage: int = Field(..., ge=0, le=100)
    missing_fields: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    suggested_follow_up_questions: List[str] = Field(default_factory=list)

class DuplicateInfo(BaseModel):
    possible_duplicate: bool
    matching_complaint_ids: List[str] = Field(default_factory=list)
    similarity_reasoning: str = Field("")
    confidence: float = Field(0.0, ge=0.0, le=1.0)

class RiskAssessmentSchema(BaseModel):
    risk_level: str = Field("LOW", description="LOW | MEDIUM | HIGH | CRITICAL")
    severity: str = Field("MINOR", description="MINOR | MAJOR | CRITICAL")
    probability: str = Field("UNLIKELY", description="RARE | UNLIKELY | POSSIBLE | LIKELY | FREQUENT")
    detectability: str = Field("HIGH", description="HIGH | MEDIUM | LOW")
    reasoning: str = Field("")
    recommended_action: str = Field("")
    key_risk_factors: List[str] = Field(default_factory=list)
    severity_score: int = Field(1, ge=1, le=5)
    probability_score: int = Field(1, ge=1, le=5)
    detectability_score: int = Field(1, ge=1, le=5)
    rpn_score: int = Field(1, description="Severity x Probability x Detectability")
    patient_safety_impact: str = Field("")
    quality_impact: str = Field("")
    regulatory_reportable: bool = False
    justification: str = Field("")

class CapaRecommendationSchema(BaseModel):
    immediate_containment: List[str] = Field(default_factory=list)
    corrective_action: str = Field("")
    preventive_action: str = Field("")
    containment_actions: List[str] = Field(default_factory=list)
    root_cause_investigation_plan: List[str] = Field(default_factory=list)
    recommended_capa: str = Field("")

class AnalysisPipelineResult(BaseModel):
    extracted_data: ExtractedComplaintInfo
    completeness: CompletenessInfo
    duplicate_info: DuplicateInfo
    risk_assessment: RiskAssessmentSchema
    capa_recommendations: CapaRecommendationSchema
    raw_content: str
    source_type: str

class ComplaintCreateSchema(BaseModel):
    product_name: Optional[str] = Field(None, description="Name of product or API raw material")
    product_name_raw: Optional[str] = Field(None, description="Raw product name from intake")
    product_code: Optional[str] = Field(None, description="Product code or catalog #")
    batch_number: Optional[str] = Field(None, description="Lot or Batch number")
    dosage_form: Optional[str] = Field(None, description="Tablet, Capsule, Injection, Bulk Powder")
    strength: Optional[str] = Field(None, description="e.g. 500mg, 100 U/mL")
    manufacturing_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    expiry_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    complaint_received_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    customer_name: Optional[str] = Field(None, description="Reporter or customer name")
    reporter_name: Optional[str] = Field(None, description="Reporter name alias")
    reporter_organization: Optional[str] = Field(None, description="Reporter organization")
    reporter_contact: Optional[str] = Field(None, description="Reporter contact")
    market: Optional[str] = Field(None, description="US, EU, APAC, Commercial, Hospital")
    country: Optional[str] = Field(None, description="Country of reporter")
    complaint_category: Optional[str] = Field(None, description="Category of defect")
    defect_category: Optional[str] = Field(None, description="Defect category alias")
    complaint_description: Optional[str] = Field(None, description="Detailed description of defect")
    defect_description: Optional[str] = Field(None, description="Defect description alias")
    quantity_affected: Optional[str] = Field(None, description="Quantity or batch size impacted")
    adverse_event: bool = Field(False, description="Whether adverse drug event occurred")
    quality_issue: Optional[str] = Field(None, description="Quality impact description")
    initial_assessment: Optional[str] = Field(None, description="Initial QA assessment note")
    severity: str = Field("MINOR", description="CRITICAL, MAJOR, or MINOR")
    probability: int = Field(1, ge=1, le=5)
    detectability: int = Field(1, ge=1, le=5)
    risk_level: str = Field("LOW", description="HIGH, MEDIUM, LOW")
    investigation_recommendation: Optional[str] = Field(None, description="Investigation roadmap")
    capa_recommendation: Optional[str] = Field(None, description="CAPA recommendation")
    status: str = Field("LOGGED", description="DRAFT, LOGGED, UNDER_INVESTIGATION, CAPA_PENDING, CLOSED")
    source_type: str = Field("TEXT", description="TEXT, EMAIL, PDF_UPLOAD, IMAGE_UPLOAD")
    raw_content: Optional[str] = Field(None, description="Raw unparsed intake text")

class ComplaintUpdateSchema(BaseModel):
    product_name: Optional[str] = None
    product_code: Optional[str] = None
    batch_number: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    complaint_received_date: Optional[str] = None
    customer_name: Optional[str] = None
    market: Optional[str] = None
    country: Optional[str] = None
    complaint_category: Optional[str] = None
    complaint_description: Optional[str] = None
    quantity_affected: Optional[str] = None
    adverse_event: Optional[bool] = None
    quality_issue: Optional[str] = None
    initial_assessment: Optional[str] = None
    severity: Optional[str] = None
    probability: Optional[int] = None
    detectability: Optional[int] = None
    risk_level: Optional[str] = None
    investigation_recommendation: Optional[str] = None
    capa_recommendation: Optional[str] = None
    status: Optional[str] = None

class ComplaintResponseSchema(ComplaintCreateSchema):
    complaint_id: str
    complaint_number: str
    is_complete: bool
    missing_fields: List[str]
    is_potential_duplicate: bool
    duplicate_of_number: Optional[str] = None
    duplicate_reason: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

class AnalyzeRequestSchema(BaseModel):
    content: str = Field(..., min_length=5, max_length=50000, description="Raw complaint text, email body, or document text")
    source_type: str = Field("TEXT", description="TEXT, EMAIL, PDF_UPLOAD, IMAGE_UPLOAD")

class RiskAssessmentRequestSchema(BaseModel):
    product_name: Optional[str] = None
    product_type: str = "FDF"
    severity: str = "MINOR"
    defect_description: str = Field(..., description="Defect description to evaluate risk")
    adverse_event: bool = False

class RiskAssessmentResponseSchema(BaseModel):
    risk_level: str = Field("LOW", description="LOW | MEDIUM | HIGH | CRITICAL")
    severity: str = Field("MINOR", description="MINOR | MAJOR | CRITICAL")
    probability: str = Field("UNLIKELY", description="RARE | UNLIKELY | POSSIBLE | LIKELY | FREQUENT")
    detectability: str = Field("HIGH", description="HIGH | MEDIUM | LOW")
    reasoning: str = Field("", description="Detailed explanation for the risk assessment")
    recommended_action: str = Field("", description="Immediate recommended next action for QA team")
    key_risk_factors: List[str] = Field(default_factory=list, description="Key risk factor tags")
    severity_score: int = Field(1, ge=1, le=5)
    probability_score: int = Field(1, ge=1, le=5)
    detectability_score: int = Field(1, ge=1, le=5)
    rpn_score: int = Field(1)
    patient_safety_impact: str = Field("")
    quality_impact: str = Field("")
    regulatory_reportable: bool = False
    justification: str = Field("")

class CompletenessRequestSchema(BaseModel):
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    customer_name: Optional[str] = None
    complaint_description: Optional[str] = None
    complaint_received_date: Optional[str] = None
    quantity_affected: Optional[str] = None
    market: Optional[str] = None
    adverse_event: Optional[bool] = None

class CompletenessResponseSchema(BaseModel):
    is_complete: bool
    completeness_percentage: int
    missing_fields: List[str]
    warnings: List[str]
    suggested_follow_up_questions: List[str]

class DuplicateCheckRequestSchema(BaseModel):
    batch_number: Optional[str] = None
    product_name: Optional[str] = None
    complaint_category: Optional[str] = None
    defect_description: Optional[str] = None
    customer_name: Optional[str] = None
    market: Optional[str] = None

class DuplicateCheckResponseSchema(BaseModel):
    possible_duplicate: bool
    matching_complaint_ids: List[str]
    similarity_reasoning: str
    confidence: float
    is_potential_duplicate: bool = False
    duplicate_of_number: Optional[str] = None
    similarity_score: float = 0.0
    duplicate_reason: Optional[str] = None

class CopilotChatRequestSchema(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000, description="User question for AI Copilot")
    complaint_context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Extracted complaint details and risk matrix")
    chat_history: Optional[List[Dict[str, str]]] = Field(default_factory=list, description="Previous conversation turns")

class CopilotChatResponseSchema(BaseModel):
    reply: str = Field(..., description="LLM generated answer grounded in complaint context")
    source: str = Field("GROQ_LLM", description="GROQ_LLM or HEURISTIC_FALLBACK")
