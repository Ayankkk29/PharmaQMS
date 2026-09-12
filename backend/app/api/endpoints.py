import io
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pypdf import PdfReader

from app.db.database import get_db
from app.db.models import ProductModel, ComplaintModel
from app.schemas.complaint import ProductSchema, AnalysisPipelineResult
from app.services.ai_service import analyze_complaint_service

router = APIRouter()

# --- Products Router ---
@router.get("/products", response_model=List[ProductSchema])
async def list_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProductModel).order_by(ProductModel.product_name))
    products = result.scalars().all()
    return [
        ProductSchema(
            id=p.id,
            product_code=p.product_code,
            product_name=p.product_name,
            type=p.type,
            dosage_form=p.dosage_form,
            manufacturer_site=p.manufacturer_site
        )
        for p in products
    ]

# --- Analytics Router ---
@router.get("/analytics/summary")
async def get_analytics_summary(db: AsyncSession = Depends(get_db)):
    query = select(ComplaintModel)
    result = await db.execute(query)
    complaints = result.scalars().all()

    total = len(complaints)
    critical = sum(1 for c in complaints if c.severity == "CRITICAL")
    major = sum(1 for c in complaints if c.severity == "MAJOR")
    minor = sum(1 for c in complaints if c.severity == "MINOR")
    complete_count = sum(1 for c in complaints if c.is_complete)
    completeness_rate = round((complete_count / total * 100), 1) if total > 0 else 100.0

    high_risk = sum(1 for c in complaints if c.risk_level == "HIGH")
    api_count = sum(1 for c in complaints if c.dosage_form and "powder" in c.dosage_form.lower())
    fdf_count = total - api_count
    pending_capas = sum(1 for c in complaints if c.status in ["LOGGED", "UNDER_INVESTIGATION", "CAPA_PENDING"])

    return {
        "total_complaints": total,
        "critical_complaints": critical,
        "major_complaints": major,
        "minor_complaints": minor,
        "completeness_rate": completeness_rate,
        "high_risk_count": high_risk,
        "api_complaints_count": api_count,
        "fdf_complaints_count": fdf_count,
        "pending_capas": pending_capas
    }

# --- File Analysis Router ---
from app.core.security import validate_uploaded_file

@router.post("/complaints/analyze-file")
async def analyze_file_endpoint(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
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
