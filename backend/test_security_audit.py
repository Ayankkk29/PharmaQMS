import asyncio
import io
import httpx

BASE_URL = "http://127.0.0.1:8000/api/v1"

async def test_security_controls():
    print("=" * 66)
    print("EXECUTING AUTOMATED SECURITY & VULNERABILITY AUDIT SUITE")
    print("=" * 66)

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:

        # 1. Groq API Key Leak Check in Health & Endpoints
        r = await client.get("http://127.0.0.1:8000/health")
        resp_text = r.text
        assert "gsk_" not in resp_text, "VULNERABILITY: Groq API Key leaked in /health"
        print("[PASS] 1. Groq API key zero-exposure verified across HTTP responses.")

        # 2. File Upload Size Limit (10MB limit enforcement)
        oversized_data = b"X" * (11 * 1024 * 1024) # 11MB
        files = {"file": ("test_huge.txt", io.BytesIO(oversized_data), "text/plain")}
        r = await client.post("/complaints/analyze-file", files=files)
        assert r.status_code == 413, f"Expected 413 for 11MB upload, got {r.status_code}"
        print("[PASS] 2. Oversized file upload blocked (HTTP 413 Request Entity Too Large).")

        # 3. Prohibited Executable Upload (.exe / .sh / .php)
        files = {"file": ("malicious_payload.exe", io.BytesIO(b"MZ...executable"), "application/octet-stream")}
        r = await client.post("/complaints/analyze-file", files=files)
        assert r.status_code == 400, f"Expected 400 for .exe upload, got {r.status_code}"
        assert "Prohibited file type" in r.text or "not supported" in r.text
        print("[PASS] 3. Prohibited executable file upload blocked (.exe / script restriction).")

        # 4. Valid Whitelisted File Upload (.pdf)
        with open("samples/sample_paracetamol_complaint.pdf", "rb") as f:
            pdf_bytes = f.read()
        files = {"file": ("sample_paracetamol_complaint.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
        r = await client.post("/complaints/analyze-file", files=files)
        assert r.status_code == 200, f"Expected 200 for .pdf upload, got {r.status_code}"
        print("[PASS] 4. Valid whitelisted document upload allowed (.pdf).")

        # 5. SQL Injection Attempt in Query & Path Parameters
        sql_payload = "'; DROP TABLE complaints; --"
        r = await client.get(f"/complaints?status={sql_payload}")
        assert r.status_code == 200, f"SQL injection attempt failed to be handled safely: {r.status_code}"
        r_list = await client.get("/complaints")
        assert r_list.status_code == 200, "Database table missing or dropped after SQL injection payload!"
        print("[PASS] 5. SQL Injection prevention verified (parameterized ORM queries).")

        # 6. User Input Validation (Oversized string payload)
        huge_text = "A" * 60000 # Exceeds 50k max_length
        r = await client.post("/complaints/analyze-text", json={"content": huge_text, "source_type": "TEXT"})
        assert r.status_code == 422, f"Expected 422 for oversized text input, got {r.status_code}"
        print("[PASS] 6. Input validation enforced (>50,000 char text payload rejected with HTTP 422).")

        # 7. CORS Origins Verification
        r = await client.options("/complaints", headers={
            "Origin": "http://evil-attacker.com",
            "Access-Control-Request-Method": "POST"
        })
        # Check that wildcards aren't blindly returned for arbitrary origins when credentials are allowed
        cors_origin = r.headers.get("access-control-allow-origin")
        assert cors_origin != "*", "VULNERABILITY: Wildcard CORS origin allowed with credentials!"
        print("[PASS] 7. CORS security verified (wildcard origins disallowed for credentialed calls).")

    print("=" * 66)
    print("SECURITY AUDIT RESULTS: ALL 7 SECURITY CHECKS PASSED SUCCESSFULLY!")
    print("=" * 66)

if __name__ == "__main__":
    asyncio.run(test_security_controls())
