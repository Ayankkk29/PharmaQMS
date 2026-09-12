import uuid
import datetime
from sqlalchemy import Column, String, Text, Boolean, Integer, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ProductModel(Base):
    __tablename__ = "products"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    product_code = Column(String(50), unique=True, nullable=False, index=True)
    product_name = Column(String(255), nullable=False)
    type = Column(String(10), nullable=False)  # 'API' or 'FDF'
    dosage_form = Column(String(100), nullable=True) # e.g. Oral Solid Tablet, Micronized Powder
    strength = Column(String(50), nullable=True) # e.g., 500mg, 100 U/mL
    manufacturer_site = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ComplaintModel(Base):
    __tablename__ = "complaints"

    complaint_id = Column(String(36), primary_key=True, default=generate_uuid)
    complaint_number = Column(String(50), unique=True, nullable=False, index=True)
    
    # Product Information
    product_name = Column(String(255), nullable=True)
    product_code = Column(String(50), nullable=True)
    batch_number = Column(String(100), nullable=True, index=True)
    dosage_form = Column(String(100), nullable=True)
    strength = Column(String(50), nullable=True)
    manufacturing_date = Column(String(20), nullable=True)
    expiry_date = Column(String(20), nullable=True)
    
    # Complainant & Market Info
    complaint_received_date = Column(String(20), nullable=True)
    customer_name = Column(String(255), nullable=True)
    market = Column(String(100), nullable=True) # e.g., US Hospital, EU Commercial, APAC Bulk
    country = Column(String(100), nullable=True)
    
    # Defect & Quality Issue
    complaint_category = Column(String(100), nullable=True)
    complaint_description = Column(Text, nullable=False)
    quantity_affected = Column(String(100), nullable=True)
    adverse_event = Column(Boolean, default=False)
    quality_issue = Column(Text, nullable=True)
    initial_assessment = Column(Text, nullable=True)
    
    # Risk Assessment (ICH Q9 Matrix)
    severity = Column(String(20), default="MINOR") # CRITICAL, MAJOR, MINOR
    probability = Column(Integer, default=1) # 1-5
    detectability = Column(Integer, default=1) # 1-5
    risk_level = Column(String(20), default="LOW") # HIGH, MEDIUM, LOW
    
    # CAPA & Investigation
    investigation_recommendation = Column(Text, nullable=True)
    capa_recommendation = Column(Text, nullable=True)
    
    # Status & Audit Metadata
    status = Column(String(30), default="LOGGED") # DRAFT, LOGGED, UNDER_INVESTIGATION, CAPA_PENDING, CLOSED
    source_type = Column(String(50), default="TEXT")
    raw_content = Column(Text, nullable=True)
    is_complete = Column(Boolean, default=False)
    missing_fields = Column(JSON, default=list)
    is_potential_duplicate = Column(Boolean, default=False)
    duplicate_of_number = Column(String(50), nullable=True)
    duplicate_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
