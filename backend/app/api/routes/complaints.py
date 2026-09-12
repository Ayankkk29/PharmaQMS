from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.complaint import (
    ComplaintCreateSchema,
    ComplaintUpdateSchema,
    ComplaintResponseSchema,
    AnalyzeRequestSchema
)
from app.services.complaint_service import (
    create_complaint,
    get_complaints,
    get_complaint_by_id,
    update_complaint
)
from app.services.ai_service import analyze_complaint_service

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("/analyze", response_model=dict, status_code=status.HTTP_200_OK)
@router.post("/analyze-text", response_model=dict, status_code=status.HTTP_200_OK)
async def analyze_complaint(
    payload: AnalyzeRequestSchema,
    db: AsyncSession = Depends(get_db)
):
    result = await analyze_complaint_service(db, content=payload.content, source_type=payload.source_type)
    return result

from app.core.security import validate_uploaded_file

@router.post("/analyze-file", response_model=dict, status_code=status.HTTP_200_OK)
async def analyze_file_complaint(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    import io
    from pypdf import PdfReader
    contents = await file.read()
    file_ext = validate_uploaded_file(file, contents)
    filename = file.filename or "uploaded_file"
    extracted_text = ""

    if file_ext == ".pdf":
        try:
            pdf_file = io.BytesIO(contents)
            reader = PdfReader(pdf_file)
            text_pages = [page.extract_text() for page in reader.pages if page.extract_text()]
            extracted_text = "\n".join(text_pages)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Failed to parse PDF document. Ensure the PDF is not encrypted or corrupt."
            )
    else:
        try:
            extracted_text = contents.decode("utf-8", errors="ignore")
        except Exception:
            extracted_text = f"Uploaded document file: {filename}"

    if not extracted_text.strip():
        extracted_text = f"Document content from file {filename}"

    result = await analyze_complaint_service(
        db,
        content=extracted_text,
        source_type="PDF_UPLOAD" if file_ext == ".pdf" else "IMAGE_UPLOAD"
    )
    return result

@router.post("", response_model=ComplaintResponseSchema, status_code=status.HTTP_201_CREATED)
@router.post("/log", response_model=ComplaintResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_new_complaint(
    payload: ComplaintCreateSchema,
    db: AsyncSession = Depends(get_db)
):
    complaint = await create_complaint(db, payload)
    return complaint

@router.get("", response_model=List[ComplaintResponseSchema], status_code=status.HTTP_200_OK)
async def list_all_complaints(
    status: Optional[str] = Query(None, description="Filter by status (DRAFT, LOGGED, UNDER_INVESTIGATION, CAPA_PENDING, CLOSED)"),
    severity: Optional[str] = Query(None, description="Filter by severity (CRITICAL, MAJOR, MINOR)"),
    product_code: Optional[str] = Query(None, description="Filter by product code"),
    db: AsyncSession = Depends(get_db)
):
    complaints = await get_complaints(db, status=status, severity=severity, product_code=product_code)
    return complaints

@router.get("/{complaint_id}", response_model=ComplaintResponseSchema, status_code=status.HTTP_200_OK)
async def get_single_complaint(
    complaint_id: str,
    db: AsyncSession = Depends(get_db)
):
    complaint = await get_complaint_by_id(db, complaint_id)
    return complaint

@router.put("/{complaint_id}", response_model=ComplaintResponseSchema, status_code=status.HTTP_200_OK)
async def update_existing_complaint(
    complaint_id: str,
    payload: ComplaintUpdateSchema,
    db: AsyncSession = Depends(get_db)
):
    updated = await update_complaint(db, complaint_id, payload)
    return updated
