export type ProductType = 'API' | 'FDF';
export type SeverityType = 'CRITICAL' | 'MAJOR' | 'MINOR';
export type ComplaintStatus = 'DRAFT' | 'LOGGED' | 'UNDER_INVESTIGATION' | 'CAPA_PENDING' | 'CLOSED';
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type NavTab = 'dashboard' | 'log' | 'analysis' | 'list' | 'detail';

export interface Product {
  id: string;
  product_code: string;
  product_name: string;
  type: ProductType;
  dosage_form?: string;
  manufacturer_site?: string;
}

export interface ExtractedComplaintInfo {
  complaint_source?: string | null;
  customer_name?: string | null;
  product_name?: string | null;
  product_type: ProductType;
  product_strength?: string | null;
  batch_number?: string | null;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
  quantity_affected?: string | null;
  complaint_type?: string | null;
  complaint_date?: string | null;
  event_date?: string | null;
  reporter_name?: string | null;
  reporter_contact?: string | null;
  reporter_organization?: string | null;
  defect_category?: string | null;
  defect_description: string;
  severity: SeverityType;
  priority?: string | null;
}

export interface CompletenessInfo {
  is_complete: boolean;
  completeness_score: number;
  completeness_percentage?: number;
  missing_fields: string[];
  warnings?: string[];
  suggested_follow_up_questions?: string[];
}

export interface DuplicateInfo {
  is_potential_duplicate: boolean;
  duplicate_of_number?: string | null;
  similarity_score: number;
  duplicate_reason?: string | null;
  possible_duplicate?: boolean;
  matching_complaint_ids?: string[];
  similarity_reasoning?: string;
  confidence?: number;
}

export type ProbabilityType = 'RARE' | 'UNLIKELY' | 'POSSIBLE' | 'LIKELY' | 'FREQUENT';
export type DetectabilityType = 'HIGH' | 'MEDIUM' | 'LOW';

export interface RiskAssessment {
  risk_level: RiskLevel;
  severity: SeverityType;
  probability: ProbabilityType;
  detectability: DetectabilityType;
  reasoning: string;
  recommended_action: string;
  key_risk_factors: string[];
  severity_score: number;
  probability_score: number;
  detectability_score: number;
  rpn_score: number;
  patient_safety_impact: string;
  quality_impact: string;
  regulatory_reportable: boolean;
  justification: string;
}

export interface CapaRecommendation {
  containment_actions?: string[];
  root_cause_investigation_plan?: string[];
  recommended_capa?: string;
  preventive_action?: string;
  immediate_containment?: string[];
  corrective_action?: string;
}

export interface AnalysisPipelineResult {
  extracted_data: ExtractedComplaintInfo;
  completeness: CompletenessInfo;
  duplicate_info: DuplicateInfo;
  risk_assessment: RiskAssessment;
  capa_recommendations: CapaRecommendation;
  raw_content: string;
  source_type: string;
}

export interface ComplaintSaveRequest {
  complaint_number?: string;
  source_type: string;
  complaint_source?: string;
  customer_name?: string;
  raw_content: string;
  product_id?: string;
  product_name_raw?: string;
  product_strength?: string;
  batch_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  quantity_affected?: string;
  complaint_type?: string;
  reporter_name?: string;
  reporter_contact?: string;
  reporter_organization?: string;
  complaint_date?: string;
  event_date?: string;
  defect_category?: string;
  defect_description?: string;
  severity: SeverityType;
  priority?: string;
  status: ComplaintStatus;
  is_complete: boolean;
  missing_fields: string[];
  is_potential_duplicate: boolean;
  duplicate_of_number?: string;
  duplicate_reason?: string;
  risk_assessment?: RiskAssessment;
  capa_recommendations?: CapaRecommendation;
}

export interface ComplaintResponse extends ComplaintSaveRequest {
  id: string;
  complaint_number: string;
  product_code?: string;
  product_type?: ProductType;
  created_at: string;
}

export interface AnalyticsSummary {
  total_complaints: number;
  critical_complaints: number;
  major_complaints: number;
  minor_complaints: number;
  completeness_rate: number;
  high_risk_count: number;
  api_complaints_count: number;
  fdf_complaints_count: number;
  pending_capas: number;
}
