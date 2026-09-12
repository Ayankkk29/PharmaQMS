import logging
from langgraph.graph import StateGraph, END
from app.graph.state import ComplaintState
from app.graph.nodes import (
    node_normalize_input,
    node_extract_info,
    node_check_completeness,
    node_assess_risk,
    node_detect_duplicates,
    node_recommend_investigation,
    node_recommend_capa,
    node_format_final_output
)

logger = logging.getLogger("pharma_qms.workflow")

def build_complaint_state_graph():
    workflow = StateGraph(ComplaintState)

    # 1. Add Nodes
    workflow.add_node("normalize_input", node_normalize_input)
    workflow.add_node("extract_info", node_extract_info)
    workflow.add_node("check_completeness", node_check_completeness)
    workflow.add_node("assess_risk", node_assess_risk)
    workflow.add_node("detect_duplicates", node_detect_duplicates)
    workflow.add_node("recommend_investigation", node_recommend_investigation)
    workflow.add_node("recommend_capa", node_recommend_capa)
    workflow.add_node("format_final_output", node_format_final_output)

    # 2. Wire Linear Pipeline Edges
    workflow.set_entry_point("normalize_input")
    workflow.add_edge("normalize_input", "extract_info")
    workflow.add_edge("extract_info", "check_completeness")
    workflow.add_edge("check_completeness", "assess_risk")
    workflow.add_edge("assess_risk", "detect_duplicates")
    workflow.add_edge("detect_duplicates", "recommend_investigation")
    workflow.add_edge("recommend_investigation", "recommend_capa")
    workflow.add_edge("recommend_capa", "format_final_output")
    workflow.add_edge("format_final_output", END)

    app = workflow.compile()
    logger.info("Successfully compiled LangGraph StateGraph Complaint Pipeline.")
    return app

complaint_state_graph = build_complaint_state_graph()

async def run_complaint_analysis(raw_text: str, input_type: str = "TEXT", existing_complaints: list = None):
    initial_state: ComplaintState = {
        "raw_input": raw_text,
        "input_type": input_type,
        "existing_complaints": existing_complaints or [],
        "extracted_complaint": {},
        "missing_fields": [],
        "completeness_score": 0,
        "risk_assessment": {},
        "duplicate_candidates": [],
        "investigation_recommendation": {},
        "capa_recommendation": {},
        "final_output": {},
        "errors": []
    }

    final_state = await complaint_state_graph.ainvoke(initial_state)
    return final_state.get("final_output", final_state)
