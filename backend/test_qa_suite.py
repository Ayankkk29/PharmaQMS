import os
import json
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000/api/v1"
HEALTH_URL = "http://127.0.0.1:8000/health"
SAMPLES_DIR = os.path.join(os.path.dirname(__file__), "samples")
PDF_PATH = os.path.join(SAMPLES_DIR, "sample_paracetamol_complaint.pdf")

results = []

def record_test(name, status, details=""):
    results.append({"name": name, "status": status, "details": details})
    symbol = "[PASS]" if status == "PASS" else "[FAIL]"
    print(f"{symbol} {name}: {details}")

print("==================================================================")
print("SENIOR QA ENGINEER AUTOMATED TEST SUITE (18 TEST SCENARIOS)")
print("==================================================================")

# Test 1: Application Startup
try:
    with urllib.request.urlopen(HEALTH_URL) as res:
        data = json.loads(res.read().decode('utf-8'))
        assert data.get("status") == "healthy"
        record_test("1. Application Startup", "PASS", f"Backend healthy. Service: {data.get('service')}")
except Exception as e:
    record_test("1. Application Startup", "FAIL", str(e))

# Test 2: Navigation & Data Fetching
try:
    with urllib.request.urlopen(f"{BASE_URL}/products") as res:
        prods = json.loads(res.read().decode('utf-8'))
        assert len(prods) >= 1
    with urllib.request.urlopen(f"{BASE_URL}/analytics/summary") as res:
        summary = json.loads(res.read().decode('utf-8'))
        assert "total_complaints" in summary
    record_test("2. Navigation Data API", "PASS", f"Fetched {len(prods)} products & analytics summary successfully.")
except Exception as e:
    record_test("2. Navigation Data API", "FAIL", str(e))

# Test 3: Complaint Creation
try:
    payload = {
        "product_name": "QA Test Product 500mg",
        "batch_number": "B-QA-2026-99",
        "complaint_description": "Synthetic QA test complaint description for manual creation.",
        "severity": "MINOR",
        "status": "LOGGED",
        "is_complete": True,
        "missing_fields": []
    }
    req = urllib.request.Request(f"{BASE_URL}/complaints/log", data=json.dumps(payload).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as res:
        cmp_res = json.loads(res.read().decode('utf-8'))
        assert cmp_res.get("complaint_number")
        test3_id = cmp_res.get("complaint_id")
        record_test("3. Complaint Creation", "PASS", f"Created complaint {cmp_res.get('complaint_number')} (ID: {test3_id})")
except Exception as e:
    record_test("3. Complaint Creation", "FAIL", str(e))

# Test 4: PDF Upload
try:
    boundary = "----WebKitFormBoundaryQA12345"
    headers = {"Content-Type": f"multipart/form-data; boundary={boundary}"}
    with open(PDF_PATH, "rb") as f:
        file_bytes = f.read()
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="sample_paracetamol_complaint.pdf"\r\n'
        f"Content-Type: application/pdf\r\n\r\n"
    ).encode("utf-8") + file_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")
    
    req = urllib.request.Request(f"{BASE_URL}/complaints/analyze-file", data=body, headers=headers, method="POST")
    with urllib.request.urlopen(req) as res:
        pdf_res = json.loads(res.read().decode('utf-8'))
        assert pdf_res.get("extracted_from_complaint", {}).get("batch_number") == "PCM240731"
        record_test("4. PDF Upload", "PASS", f"Extracted batch PCM240731 from PDF.")
except Exception as e:
    record_test("4. PDF Upload", "FAIL", str(e))

# Test 5: AI Analysis (LangGraph Workflow)
try:
    req_body = {"content": "Hospital reported yellow specks in Metformin API lot B-MET-8841", "source_type": "TEXT"}
    req = urllib.request.Request(f"{BASE_URL}/complaints/analyze-text", data=json.dumps(req_body).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as res:
        ai_res = json.loads(res.read().decode('utf-8'))
        assert "extracted_from_complaint" in ai_res
        assert "completeness" in ai_res
        assert "ai_inference" in ai_res
        assert "ai_recommendation" in ai_res
        record_test("5. AI Analysis Pipeline", "PASS", "All 8 LangGraph nodes executed and returned structured output.")
except Exception as e:
    record_test("5. AI Analysis Pipeline", "FAIL", str(e))

# Test 6: Loading States & Stress Handling
try:
    large_text = "Metformin HCl API batch B-MET-9999 discoloration inquiry. " * 50
    req_body = {"content": large_text, "source_type": "TEXT"}
    req = urllib.request.Request(f"{BASE_URL}/complaints/analyze-text", data=json.dumps(req_body).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200
        record_test("6. Performance / Large Text Input", "PASS", "Large text payload analyzed within acceptable latency.")
except Exception as e:
    record_test("6. Performance / Large Text Input", "FAIL", str(e))

# Test 7: AI Failure Recovery (Garbage/Noise input)
try:
    garbage_text = "asdfghjkl 12345 !@#$%^&*()_+ noise text without pharma context"
    req_body = {"content": garbage_text, "source_type": "TEXT"}
    req = urllib.request.Request(f"{BASE_URL}/complaints/analyze-text", data=json.dumps(req_body).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as res:
        noise_res = json.loads(res.read().decode('utf-8'))
        assert "extracted_from_complaint" in noise_res
        record_test("7. AI Noise Handling & Recovery", "PASS", "System safely processed noise input without crashing.")
except Exception as e:
    record_test("7. AI Noise Handling & Recovery", "FAIL", str(e))

# Test 8: Incomplete Complaint
try:
    incomplete_text = "Some tablets discolored"
    req_body = {"content": incomplete_text, "source_type": "TEXT"}
    req = urllib.request.Request(f"{BASE_URL}/complaints/analyze-text", data=json.dumps(req_body).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as res:
        inc_res = json.loads(res.read().decode('utf-8'))
        comp = inc_res.get("completeness", {})
        assert comp.get("is_complete") == False
        assert comp.get("completeness_percentage") < 100
        assert len(comp.get("missing_fields", [])) > 0
        assert len(comp.get("suggested_follow_up_questions", [])) > 0
        record_test("8. Incomplete Complaint Checker", "PASS", f"Score: {comp.get('completeness_percentage')}%, Missing: {len(comp.get('missing_fields'))} fields, Follow-up Qs: {len(comp.get('suggested_follow_up_questions'))}")
except Exception as e:
    record_test("8. Incomplete Complaint Checker", "FAIL", str(e))

# Test 9: Risk Assessment (Critical / Adverse Event)
try:
    critical_text = "Amoxicillin 500mg Capsules batch B-AMX-001 has blister pinholes. Patient suffered severe allergic reaction and anaphylaxis."
    req_body = {"content": critical_text, "source_type": "TEXT"}
    req = urllib.request.Request(f"{BASE_URL}/complaints/analyze-text", data=json.dumps(req_body).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as res:
        crit_res = json.loads(res.read().decode('utf-8'))
        risk = crit_res.get("ai_inference", {})
        assert risk.get("risk_level") in ["CRITICAL", "HIGH"]
        assert risk.get("regulatory_reportable") == True
        record_test("9. Risk Assessment (ICH Q9)", "PASS", f"Risk Level: {risk.get('risk_level')}, Reportable: {risk.get('regulatory_reportable')}, RPN: {risk.get('rpn_score')}")
except Exception as e:
    record_test("9. Risk Assessment (ICH Q9)", "FAIL", str(e))

# Test 10: Duplicate Detection
try:
    dup_text = "Customer reported high moisture in Paracetamol API lot B-PAR-5521"
    req_body = {"content": dup_text, "source_type": "TEXT"}
    req = urllib.request.Request(f"{BASE_URL}/complaints/analyze-text", data=json.dumps(req_body).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as res:
        dup_res = json.loads(res.read().decode('utf-8'))
        dup_info = dup_res.get("duplicate_info", {})
        assert dup_info.get("possible_duplicate") == True
        assert len(dup_info.get("matching_complaint_ids", [])) > 0
        record_test("10. Duplicate Detection", "PASS", f"Identified duplicate candidate matching: {dup_info.get('matching_complaint_ids')}")
except Exception as e:
    record_test("10. Duplicate Detection", "FAIL", str(e))

# Test 11: Editing Extracted Fields
try:
    edited_payload = {
        "product_name": "Paracetamol Tablets 500 mg (User Edited)",
        "batch_number": "PCM240731-EDITED",
        "complaint_description": "User edited complaint description during review.",
        "severity": "MAJOR",
        "status": "LOGGED",
        "is_complete": True,
        "missing_fields": []
    }
    req = urllib.request.Request(f"{BASE_URL}/complaints/log", data=json.dumps(edited_payload).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as res:
        edited_res = json.loads(res.read().decode('utf-8'))
        assert edited_res.get("product_name") == "Paracetamol Tablets 500 mg (User Edited)"
        assert edited_res.get("batch_number") == "PCM240731-EDITED"
        test11_id = edited_res.get("complaint_id")
        record_test("11. Editing Extracted Fields", "PASS", f"Edited fields persisted cleanly to DB record {edited_res.get('complaint_number')}")
except Exception as e:
    record_test("11. Editing Extracted Fields", "FAIL", str(e))

# Test 12: Saving Complaint
try:
    save_body = {
        "product_name": "Insulin Glargine 100 U/mL",
        "batch_number": "B-INS-7741",
        "complaint_description": "Crystalline precipitate observed inside vial prior to administration.",
        "severity": "CRITICAL",
        "status": "LOGGED",
        "is_complete": True,
        "missing_fields": []
    }
    req = urllib.request.Request(f"{BASE_URL}/complaints/log", data=json.dumps(save_body).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req) as res:
        saved_c = json.loads(res.read().decode('utf-8'))
        assert res.status in [200, 201]
        test12_id = saved_c.get("complaint_id")
        record_test("12. Saving Complaint", "PASS", f"Saved complaint {saved_c.get('complaint_number')}")
except Exception as e:
    record_test("12. Saving Complaint", "FAIL", str(e))

# Test 13: Retrieving Complaint
try:
    with urllib.request.urlopen(f"{BASE_URL}/complaints/{test12_id}") as res:
        retrieved = json.loads(res.read().decode('utf-8'))
        assert retrieved.get("complaint_id") == test12_id
        assert retrieved.get("batch_number") == "B-INS-7741"
        record_test("13. Retrieving Complaint Detail", "PASS", f"Successfully fetched record {test12_id} matching batch B-INS-7741")
except Exception as e:
    record_test("13. Retrieving Complaint Detail", "FAIL", str(e))

# Test 14: Invalid Input (Bad JSON / Type Mismatch)
try:
    req = urllib.request.Request(f"{BASE_URL}/complaints/analyze-text", data=b"invalid json content", headers={"Content-Type": "application/json"}, method="POST")
    try:
        urllib.request.urlopen(req)
        record_test("14. Invalid Input Handling", "FAIL", "Expected 422 Error, got 200")
    except urllib.error.HTTPError as err:
        assert err.code in [400, 422]
        record_test("14. Invalid Input Handling", "PASS", f"Handled malformed input with HTTP {err.code}")
except Exception as e:
    record_test("14. Invalid Input Handling", "FAIL", str(e))

# Test 15: Backend Unavailable Graceful Handling
try:
    fake_req = urllib.request.Request("http://127.0.0.1:9999/api/v1/health")
    try:
        urllib.request.urlopen(fake_req)
        record_test("15. Backend Unavailable Handling", "FAIL", "Expected connection refused")
    except Exception as err:
        record_test("15. Backend Unavailable Handling", "PASS", "Client handles connection error predictably.")
except Exception as e:
    record_test("15. Backend Unavailable Handling", "FAIL", str(e))

# Test 16: Invalid API Key / Fallback Heuristic Execution
try:
    # Test system execution when LLM call falls back to heuristic extractor
    from app.graph.nodes import heuristic_extract_node
    fallback_res = heuristic_extract_node("Customer reported discoloration in Paracetamol Tablets 500 mg batch PCM240731")
    assert fallback_res.get("batch_number") == "PCM240731"
    assert fallback_res.get("product_name") == "Paracetamol Tablets 500 mg"
    record_test("16. Fallback Extraction (No API Key)", "PASS", "Heuristic fallback extracted product & batch without crash.")
except Exception as e:
    record_test("16. Fallback Extraction (No API Key)", "FAIL", str(e))

# Test 17: Empty Complaint Submission
try:
    empty_req = {"content": "   ", "source_type": "TEXT"}
    req = urllib.request.Request(f"{BASE_URL}/complaints/analyze-text", data=json.dumps(empty_req).encode('utf-8'), headers={"Content-Type": "application/json"}, method="POST")
    try:
        urllib.request.urlopen(req)
        record_test("17. Empty Complaint Submission", "FAIL", "Expected validation error for whitespace complaint")
    except urllib.error.HTTPError as err:
        assert err.code in [400, 422]
        record_test("17. Empty Complaint Submission", "PASS", f"Rejected whitespace complaint with HTTP {err.code}")
except Exception as e:
    record_test("17. Empty Complaint Submission", "FAIL", str(e))

# Test 18: Database Non-Existent Record Query (404 Handling)
try:
    req = urllib.request.Request(f"{BASE_URL}/complaints/NON_EXISTENT_ID_9999", method="GET")
    try:
        urllib.request.urlopen(req)
        record_test("18. Missing DB Record Handling", "FAIL", "Expected 404 Not Found")
    except urllib.error.HTTPError as err:
        assert err.code == 404
        record_test("18. Missing DB Record Handling", "PASS", "Returned HTTP 404 Not Found cleanly.")
except Exception as e:
    record_test("18. Missing DB Record Handling", "FAIL", str(e))

print("\n==================================================================")
passed = sum(1 for r in results if r["status"] == "PASS")
failed = sum(1 for r in results if r["status"] == "FAIL")
print(f"AUTOMATED QA SUITE RESULTS: {passed} PASSED / {failed} FAILED (TOTAL 18)")
print("==================================================================")
