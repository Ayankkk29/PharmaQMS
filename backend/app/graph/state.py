from typing import TypedDict, List, Dict, Optional, Any

class ComplaintState(TypedDict):
    raw_input: str
    input_type: str  # TEXT, EMAIL, PDF_UPLOAD, IMAGE_UPLOAD
    existing_complaints: List[Dict[str, Any]]
    
    # 1. Extracted Information (Factually Grounded)
    extracted_complaint: Dict[str, Any]
    
    # 2. Completeness Check
    missing_fields: List[str]
    completeness_score: int  # 0 to 100
    warnings: List[str]
    suggested_follow_up_questions: List[str]
    
    # 3. Risk Assessment (AI Inference)
    risk_assessment: Dict[str, Any]
    
    # 4. Duplicate Screening
    duplicate_candidates: List[Dict[str, Any]]
    
    # 5. Investigation Recommendation (AI Recommendation)
    investigation_recommendation: Dict[str, Any]
    
    # 6. CAPA Recommendation (AI Recommendation)
    capa_recommendation: Dict[str, Any]
    
    # 7. Final Output Payload (FastAPI Schema Compatible)
    final_output: Dict[str, Any]
    
    # Error tracking
    errors: List[str]
