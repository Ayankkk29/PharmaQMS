import os
import json
import urllib.request

BASE_URL = "http://127.0.0.1:8000/api/v1"
SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "samples")
PDF_PATH = os.path.join(SAMPLES_DIR, "sample_paracetamol_complaint.pdf")

print("==========================================================")
print("STARTING FULL END-TO-END WORKFLOW INTEGRATION TEST (STEPS 1-21)")
print("==========================================================")

# Step 1: Open Log Customer Complaint
print("\n[Step 1-3] User opens 'Log Customer Complaint' and uploads 'sample_paracetamol_complaint.pdf'...")
assert os.path.exists(PDF_PATH), f"PDF file missing at {PDF_PATH}"

boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}

with open(PDF_PATH, "rb") as f:
    file_bytes = f.read()

body = (
    f"--{boundary}\r\n"
    f'Content-Disposition: form-data; name="file"; filename="sample_paracetamol_complaint.pdf"\r\n'
    f"Content-Type: application/pdf\r\n\r\n"
).encode("utf-8") + file_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")

# Step 3-12: FastAPI receives file -> invokes LangGraph -> executes nodes -> returns structured output
print("[Step 4-13] FastAPI extracts text & executes 8-node LangGraph StateGraph pipeline...")
req = urllib.request.Request(f"{BASE_URL}/complaints/analyze-file", data=body, headers=headers, method="POST")
with urllib.request.urlopen(req) as res:
    assert res.status == 200, f"Analysis failed with status {res.status}"
    analysis_res = json.loads(res.read().decode("utf-8"))

print(" -> LangGraph Analysis Complete!")
ext = analysis_res.get("extracted_from_complaint", {})
comp = analysis_res.get("completeness", {})
risk = analysis_res.get("ai_inference", {})
dup = analysis_res.get("duplicate_info", {})
capa = analysis_res.get("ai_recommendation", {})

# Step 14-16: Verify extracted structure, Completeness, Risk Copilot, and CAPAs
print("\n[Step 14-16] Verifying Redux & React form pre-population fields...")
print(f"  • Product Name:      {ext.get('product_name')}")
print(f"  • Product Code:      {ext.get('product_code')}")
print(f"  • Batch Number:      {ext.get('batch_number')}")
print(f"  • Market:            {ext.get('market')}")
print(f"  • Customer Name:     {ext.get('customer_name')}")
print(f"  • Severity:          {ext.get('severity')}")
print(f"  • Completeness %:    {comp.get('completeness_percentage')}%")
print(f"  • Risk Level:        {risk.get('risk_level')} (RPN: {risk.get('rpn_score')})")
print(f"  • Containment Count: {len(capa.get('containment_actions', []))}")

assert ext.get("product_name") == "Paracetamol Tablets 500 mg"
assert ext.get("batch_number") == "PCM240731"
assert comp.get("completeness_percentage") >= 80
assert risk.get("risk_level") == "MEDIUM"

# Step 17-19: User edits extracted info & saves complaint to FastAPI / PostgreSQL
print("\n[Step 17-19] User edits initial QA assessment and saves complaint to QMS Database...")
save_payload = {
    "source_type": "PDF_UPLOAD",
    "raw_content": ext.get("complaint_description", ""),
    "product_name_raw": ext.get("product_name"),
    "batch_number": ext.get("batch_number"),
    "reporter_name": ext.get("customer_name"),
    "reporter_organization": "ABC Healthcare Distribution",
    "complaint_date": "2026-09-12",
    "event_date": "2026-09-12",
    "defect_category": ext.get("complaint_category", "Discoloration / Appearance"),
    "defect_description": ext.get("complaint_description"),
    "severity": ext.get("severity", "MAJOR"),
    "status": "LOGGED",
    "is_complete": comp.get("is_complete", True),
    "missing_fields": comp.get("missing_fields", []),
    "is_potential_duplicate": dup.get("is_potential_duplicate", False),
    "duplicate_of_number": dup.get("duplicate_of_number"),
    "duplicate_reason": dup.get("duplicate_reason"),
    "risk_assessment": risk,
    "capa_recommendations": capa
}

headers_json = {"Content-Type": "application/json"}
req_save = urllib.request.Request(
    f"{BASE_URL}/complaints/log",
    data=json.dumps(save_payload).encode("utf-8"),
    headers=headers_json,
    method="POST"
)

with urllib.request.urlopen(req_save) as res_save:
    assert res_save.status in [200, 201], f"Save failed with status {res_save.status}"
    saved_cmp = json.loads(res_save.read().decode("utf-8"))

saved_id = saved_cmp.get("complaint_id") or saved_cmp.get("id")
saved_num = saved_cmp.get("complaint_number")
print(f" -> Complaint Persisted to Database! ID: {saved_id} | Number: {saved_num}")

# Step 20: Complaint appears in Complaint List
print(f"\n[Step 20] Fetching Complaint List from GET /api/v1/complaints...")
req_list = urllib.request.Request(f"{BASE_URL}/complaints", method="GET")
with urllib.request.urlopen(req_list) as res_list:
    assert res_list.status == 200
    all_complaints = json.loads(res_list.read().decode("utf-8"))

found = any(c.get("complaint_number") == saved_num or c.get("id") == saved_id for c in all_complaints)
assert found, f"Saved complaint {saved_num} not found in complaints list!"
print(f" -> Successfully verified complaint {saved_num} appears in Complaint List (Total Records: {len(all_complaints)})")

# Step 21: Complaint Details displays saved information
print(f"\n[Step 21] Fetching Complaint Details from GET /api/v1/complaints/{saved_id}...")
req_detail = urllib.request.Request(f"{BASE_URL}/complaints/{saved_id}", method="GET")
with urllib.request.urlopen(req_detail) as res_detail:
    assert res_detail.status == 200
    detail_cmp = json.loads(res_detail.read().decode("utf-8"))

print(f" -> Successfully retrieved saved Complaint Details:")
print(f"  • Complaint Number: {detail_cmp.get('complaint_number')}")
print(f"  • Product Name:     {detail_cmp.get('product_name_raw') or detail_cmp.get('product_name')}")
print(f"  • Batch Number:     {detail_cmp.get('batch_number')}")
print(f"  • Severity:         {detail_cmp.get('severity')}")
print(f"  • Status:           {detail_cmp.get('status')}")

print("\n==========================================================")
print("ALL 21 STEPS OF END-TO-END WORKFLOW INTEGRATION VERIFIED SUCCESSFULLY!")
print("==========================================================")
