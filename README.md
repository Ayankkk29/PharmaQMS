# PharmaQMS — Enterprise AI Customer Complaint Management System

> **AI Product Engineer Internship Submission**  
> An end-to-end, production-grade Quality Management System (QMS) for pharmaceutical manufacturing (API & Finished Dosage Forms), powered by **LangGraph (Async `ainvoke`)**, **Groq LLM Infrastructure**, **FastAPI**, **React 18**, **Redux Toolkit**, and **PostgreSQL**.

---

## 🏗️ End-to-End System Architecture

The application implements a strict, resilient AI processing pipeline architecture:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     FRONTEND PRESENTATION LAYER                                  │
│   React 18 + Redux Toolkit + Tailwind CSS + Lucide Icons                                          │
│   • Modular Component Architecture (IntakeWorkflow, ComplaintForm, AICopilotPanel)               │
│   • Tabbed & Collapsible Analysis Sections (Analysis Summary, Quality Risk, Duplicates, CAPA)     │
│   • QMS Analytics Dashboard, Interactive Risk Matrix, Audit Trail & Complaint Register            │
└───────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                │  JSON / Multipart REST API
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      BACKEND APPLICATION LAYER                                    │
│   FastAPI (Python 3.10+) + Pydantic v2 + Security Middleware                                      │
│   • Async REST API Routers (/api/v1/complaints, /api/v1/ai)                                     │
│   • Input Validation (>50k char limits, 10MB upload limits, executable upload protection)        │
│   • Strict CORS Security & Exception Masking                                                     │
└───────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                │  Async State Injection (await ainvoke)
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   LANGGRAPH ORCHESTRATION PIPELINE                               │
│   LangGraph StateGraph Async Workflow (8 Nodes)                                                  │
│   1. Input Normalization → 2. Information Extraction → 3. Completeness Check → 4. Risk Assessment│
│   5. Duplicate Detection → 6. Dynamic LLM Investigation → 7. LLM CAPA → 8. Final Output Synthesis│
└───────────────────────┬──────────────────────────────────────────────────┬───────────────────────┘
                        │ API Invocations                                  │ DB Persistence
                        ▼                                                  ▼
┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
│            LLM PROVIDER ENGINE               │  │           PERSISTENCE & STORAGE              │
│  Groq Cloud Infrastructure                   │  │  PostgreSQL (Production) / SQLite (Fallback) │
│  • Primary Model: gemma2-9b-it               │  │  • SQLAlchemy 2.0 Async ORM                  │
│  • Optional Model: llama-3.3-70b-versatile    │  │  • Full Audit History & Batch Indexing       │
└──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘
```

---

## 🎯 Technical Architecture Rationale

During technical interviews, the following architectural choices can be explicitly defended:

1. **Separation of LLM Fact Extraction & Deterministic Risk Calculations**:
   - **Fact Extraction & Recommendations**: Powered by LLM (Groq `gemma2-9b-it`) using structured Pydantic models to extract entities from unstructured documents and generate customized 5-Whys investigation roadmaps and CAPA actions.
   - **Deterministic Quality Risk Math**: Calculated deterministically in Python ($RPN = \text{Severity} \times \text{Probability} \times \text{Detectability}$). In regulated pharmaceutical software, deterministic math ensures exact risk scoring rather than relying on LLM arithmetic estimations.

2. **Native Asynchronous LangGraph Invocation (`await ainvoke`)**:
   - LangGraph `CompiledGraph` is invoked asynchronously (`await complaint_state_graph.ainvoke(initial_state)`), preventing event loop blocking inside async FastAPI services.

3. **Responsible Regulatory Terminology**:
   - Uses compliance-accurate labeling (`Intake Complete`, `Potentially Reportable — QA Review Required`) and explicitly displays `"AI-generated assessment — Human review required"` across all AI recommendations.

4. **Modular React Component Hierarchy**:
   - Refactored `IntakePage.tsx` into decoupled sub-components (`IntakeWorkflow`, `ComplaintForm`, `AICopilotPanel`) for clean separation of concerns and maintainability.

5. **Multi-Format Document Parsing Engine**:
   - High-fidelity extraction supporting **PDF** (`pypdf`), **DOCX** (`python-docx`), **EML** (`email.message_from_bytes`), and **TXT** (`utf-8`). Ensures structured entity extraction across emails, batch records, customer letters, and word documents.

6. **Grounded AI Copilot LLM Chat Endpoint (`POST /api/v1/ai/copilot-chat`)**:
   - Interactive Q&A copilot powered by Groq LLM (`gemma2-9b-it`) grounded directly in extracted complaint context, risk scores, and CAPA recommendations, with zero key exposure and intelligent fallback.

7. **Demo & Development Resilience Fallback**:
   - Uses PostgreSQL for primary persistence with an automatic zero-config SQLite fallback for local evaluation and demonstration without database setup overhead.

---

## 📁 Repository Folder Structure

```
pharma-complaint-system/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── ai.py              # AI Copilot standalone endpoints
│   │   │   │   └── complaints.py      # Complaints CRUD & LangGraph triggers
│   │   │   └── endpoints.py           # Product catalog & Analytics summary APIs
│   │   ├── core/
│   │   │   ├── config.py             # Settings, model selection, CORS origins & upload limits
│   │   │   └── security.py           # File validation, size limits & security middleware
│   │   ├── db/
│   │   │   ├── database.py           # Async SQLAlchemy engine with SQLite fallback
│   │   │   ├── models.py             # PostgreSQL database schemas (Complaint & Product)
│   │   │   └── seed.py               # Pre-populated demonstration complaints
│   │   ├── graph/
│   │   │   ├── nodes.py              # 8 LangGraph StateGraph pipeline nodes
│   │   │   ├── state.py              # Typed Graph State object
│   │   │   └── workflow.py           # Async StateGraph compilation & ainvoke execution
│   │   ├── schemas/
│   │   │   └── complaint.py          # Pydantic v2 validation models
│   │   ├── services/
│   │   │   ├── ai_service.py         # ICH Q9 Quality Risk matrix & LLM Copilot Chat
│   │   │   ├── complaint_service.py  # Complaint creation & DB persistence service
│   │   │   └── document_parser.py    # Multi-format document engine (PDF, DOCX, EML, TXT)
│   │   └── main.py                   # FastAPI app entry point & security middleware
│   ├── samples/                      # Demonstration test documents (PDF, EML, TXT, DOCX)
│   ├── test_multi_format_parser.py   # Multi-format parser & LLM Copilot Chat test script
│   ├── test_e2e_workflow.py          # 21-step E2E integration test script
│   ├── test_qa_suite.py              # 18-scenario automated QA test suite
│   ├── test_security_audit.py        # 7-check security & vulnerability test suite
│   ├── requirements.txt              # Python backend dependencies
│   ├── .env.example                  # Environment configuration template
│   └── .gitignore
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── intake/
    │   │   │   ├── IntakeWorkflow.tsx# 4-step workflow step indicator
    │   │   │   ├── ComplaintForm.tsx # 7-col sectioned intake form
    │   │   │   └── AICopilotPanel.tsx# 5-col right panel with tabbed analysis sections
    │   │   ├── Header.tsx            # Navigation header & branding
    │   │   ├── Sidebar.tsx           # Compact 240px sidebar
    │   │   ├── RiskAssessmentCard.tsx# ICH Q9 Risk Matrix card
    │   │   ├── CompletenessCard.tsx  # Intake completeness card
    │   │   ├── DuplicateAlert.tsx    # Duplicate candidate alert card
    │   │   └── CapaCard.tsx          # CAPA & 5-Whys roadmap card
    │   ├── pages/
    │   │   ├── IntakePage.tsx        # Orchestrator intake workspace
    │   │   ├── DashboardPage.tsx     # QMS KPI Analytics & Risk Overview
    │   │   ├── ComplaintListPage.tsx # Interactive Complaint Register table
    │   │   ├── ComplaintDetailsPage.tsx # Detailed audit log & investigation view
    │   │   └── AIAnalysisPage.tsx    # Standalone AI Copilot analysis workspace
    │   ├── store/
    │   │   ├── slices/               # Redux Toolkit Slices (intake, complaints, products)
    │   │   └── index.ts              # Redux Store configuration
    │   ├── types/
    │   │   └── index.ts              # TypeScript interface definitions
    │   ├── App.tsx                   # Main React application layout
    │   └── main.tsx                  # React entry point
    ├── package.json                  # Frontend dependencies
    ├── vite.config.ts                # Vite build configuration
    ├── .env.example
    └── .gitignore
```

---

## 🚀 Setup & Execution Guide

### Prerequisites
- **Python**: `3.10+`
- **Node.js**: `18.0+`
- **npm**: `9.0+`

---

### 1. Backend Setup (FastAPI & LangGraph)

```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment configuration file
cp .env.example .env

# (Optional) Add your Groq API Key to backend/.env:
# GROQ_API_KEY=gsk_your_actual_key_here

# Launch FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend server runs at `http://127.0.0.1:8000`. Interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.*

---

### 2. Frontend Setup (React & Redux)

```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite dev server
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## 🧪 Automated Test & Verification Suites

Execute the built-in test suites from the `backend` directory:

```bash
cd backend

# 1. Run Multi-Format Document Parsing & LLM Copilot Chat Test
python test_multi_format_parser.py

# 2. Run 21-Step End-to-End Workflow Integration Test
python test_e2e_workflow.py

# 3. Run 18-Scenario Senior QA Engineering Test Suite
python test_qa_suite.py

# 4. Run 7-Check Security & Vulnerability Test Suite
python test_security_audit.py
```

---

## 🎮 End-to-End Demonstration Workflow

1. **Open Intake Page**: Click **Log Customer Complaint** in the sidebar.
2. **Upload Demonstration Document**: Drag & drop `backend/samples/sample_paracetamol_complaint.pdf` into the AI Copilot dropzone (or click **Paste Complaint Text / Email** and select the Paracetamol sample template).
3. **Automated LangGraph Pipeline Execution**:
   - Extraction progress bar fills from 10% to 100%.
   - LangGraph extracts `Product Name` (*Paracetamol Tablets 500 mg*), `Batch Number` (*PCM240731*), `Market` (*India*), `Quantity Affected` (*15 strips*), and `Complaint Description`.
4. **Form Pre-Population**: Form fields automatically populate with extracted data for QA review.
5. **AI Assistant Copilot Panel**:
   - Displays completeness score (`87%`), missing fields alert, duplicate candidate matching alerts, and ICH Q9 Risk Matrix assessment.
   - Filter analysis cards via section tabs (`Analysis`, `Risk`, `Duplicates`, `CAPA`).
6. **Save Complaint**: Click **Save Complaint**. Complaint persists to PostgreSQL/SQLite and receives unique ID (`CMP-2026-XXXX`).
7. **Complaint Register & Audit View**: Redirects to **Complaint Register**. Click on the complaint row to view the full audit record, risk breakdown, investigation plan, and recommended CAPA.

---

## 🎯 Key Codebase Files for Technical Interviews

1. **LangGraph Pipeline (`backend/app/graph/workflow.py` & `nodes.py`)**  
   - Demonstrates async StateGraph compilation (`await ainvoke`), typed state updates, Pydantic fact extraction, and dynamic LLM investigation/CAPA generation.
2. **ICH Q9 Quality Risk Service (`backend/app/services/ai_service.py`)**  
   - Demonstrates deterministic calculation of Risk Priority Number ($RPN = S \times P \times D$), duplicate detection algorithms, and fallback heuristics.
3. **Security Middleware & Upload Validation (`backend/app/core/security.py` & `main.py`)**  
   - Demonstrates 10MB file size limits, extension whitelisting, executable blocking, CORS origin restriction, and global exception secret masking.
4. **React Modular Component Hierarchy (`frontend/src/components/intake/`)**  
   - Demonstrates clean decoupling (`IntakeWorkflow`, `ComplaintForm`, `AICopilotPanel`) and tabbed section navigation.
5. **Redux Toolkit State Management (`frontend/src/store/slices/intakeSlice.ts` & `complaintsSlice.ts`)**  
   - Demonstrates async thunks, state normalization, and seamless API integration.

---

## 📜 License & Compliance

Developed for pharmaceutical QMS demonstration purposes under **ICH Q9 Quality Risk Management** and **EU GMP Annex 11 / FDA 21 CFR Part 11** guidelines.
