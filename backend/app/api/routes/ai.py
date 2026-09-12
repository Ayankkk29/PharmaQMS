from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.complaint import (
    RiskAssessmentRequestSchema,
    RiskAssessmentResponseSchema,
    CompletenessRequestSchema,
    CompletenessResponseSchema,
    DuplicateCheckRequestSchema,
    DuplicateCheckResponseSchema
)
from app.services.ai_service import (
    calculate_risk_assessment,
    evaluate_completeness,
    check_duplicates
)

router = APIRouter(prefix="/ai", tags=["AI Copilot Services"])

@router.post("/risk-assessment", response_model=RiskAssessmentResponseSchema, status_code=status.HTTP_200_OK)
async def post_risk_assessment(payload: RiskAssessmentRequestSchema):
    return calculate_risk_assessment(
        product_name=payload.product_name,
        product_type=payload.product_type,
        severity_str=payload.severity,
        defect_description=payload.defect_description,
        adverse_event=payload.adverse_event
    )

@router.post("/completeness", response_model=CompletenessResponseSchema, status_code=status.HTTP_200_OK)
async def post_completeness_check(payload: CompletenessRequestSchema):
    return evaluate_completeness(payload.model_dump())

@router.post("/duplicate-check", response_model=DuplicateCheckResponseSchema, status_code=status.HTTP_200_OK)
async def post_duplicate_check(
    payload: DuplicateCheckRequestSchema,
    db: AsyncSession = Depends(get_db)
):
    return await check_duplicates(
        db,
        batch_number=payload.batch_number,
        product_name=payload.product_name,
        defect_description=payload.defect_description
    )
