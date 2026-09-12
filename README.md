# PharmaQMS — Enterprise AI Customer Complaint Management System

> **AI Product Engineer Internship Submission**  
> An end-to-end, production-grade Quality Management System (QMS) for pharmaceutical manufacturing (API & Finished Dosage Forms), powered by **LangGraph**, **Groq LLM Infrastructure**, **FastAPI**, **React**, **Redux Toolkit**, and **PostgreSQL**.

---

## 🏗️ End-to-End System Architecture

The application strictly implements the full AI processing pipeline architecture:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     FRONTEND PRESENTATION LAYER                                  │
│   React 18 + Redux Toolkit + Tailwind CSS + Lucide Icons                                          │
│   • 2-Column Split Intake Workspace (Log Customer Complaint Form + AI Intake Assistant Panel)    │
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
                                                │  Typed State Injection
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   LANGGRAPH ORCHESTRATION PIPELINE                               │
│   LangGraph StateGraph Workflow (8 Nodes)                                                         │
│   1. Input Normalization → 2. Information Extraction → 3. Completeness Check → 4. Risk Assessment│
│   5. Duplicate Detection → 6. Investigation Rec. → 7. CAPA Rec. → 8. Final Structured Synthesis   │
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

## ⭐ Core Product & AI Engineering Highlights

### 1. 8-Node LangGraph StateGraph Pipeline
The complaint processing workflow uses a explicit `StateGraph` state machine with typed state container (`ComplaintGraphState`):
- **Input Normalization Node**: Standardizes PDF text, raw text, and email payloads.
- **Complaint Information Extraction Node**: Uses structured Pydantic schemas to extract product name, batch/lot number, strength, dosage form, market, customer, date, and defect description.
- **Completeness Checker Node**: Evaluates presence of mandatory regulatory fields, computes completeness score %, highlights missing items, and generates target follow-up questions.
- **ICH Q9 Quality Risk Assessment Node**: Calculates Risk Priority Number ($RPN = \text{Severity} \times \text{Probability} \times \text{Detectability}$) and flags FDA 15-Day Reportable events.
- **Duplicate Complaint Detection Node**: Compares batch numbers and quality defect patterns against historical database records.
- **Investigation Recommendation Node**: Generates root cause investigation roadmaps and lab retain sample testing plans.
- **CAPA Recommendation Node**: Recommends immediate containment actions and long-term preventive actions.
- **Final Output Synthesis Node**: Consolidates all node results into a machine-readable JSON object matching FastAPI schemas.

### 2. High-Availability Fallback Engine
Includes a heuristic extraction and risk calculation engine. If the Groq API key is unconfigured or encounters network limits, the system seamlessly degrades to rule-based processing without crashing or returning errors to the user.

### 3. Enterprise Security & Compliance Controls
- **Zero API Key Leakage**: Groq API keys remain encapsulated inside the backend environment.
- **File Upload Security**: Enforces a 10MB size limit and strict extension whitelist (`.pdf`, `.txt`, `.eml`, `.csv`, `.docx`, `.doc`, `.json`, `.png`, `.jpg`, `.jpeg`). Executables (`.exe`, `.bat`, `.sh`, `.php`, `.py`) are blocked.
- **SQL Injection Prevention**: All queries use SQLAlchemy 2.0 ORM parameter binding.
- **Restricted CORS & Error Masking**: Configured CORS origins with credentials enabled; internal exceptions are masked to prevent stack trace or secret exposure.

---

## 📁 Repository Folder Structure

```
pharma-complaint-system/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── ai.py              # AI Copilot standalone endpoints
│   │   │   │   └── complaints.py      # Complaints CRUD & LangGraph trigger routes
│   │   │   └── endpoints.py           # Product & Analytics endpoints
│   │   ├── core/
│   │   │   ├── config.py             # Environment & settings configuration
│   │   │   └── security.py           # File upload security & payload validators
│   │   ├── db/
│   │   │   ├── database.py           # SQLAlchemy async engine & SQLite fallback
│   │   │   ├── models.py             # PostgreSQL Complaint & Product ORM models
│   │   │   └── seed.py               # Initial QMS seed data generator
│   │   ├── graph/
│   │   │   ├── nodes.py              # LangGraph StateGraph pipeline nodes
│   │   │   ├── state.py              # Typed Graph State definition
│   │   │   └── workflow.py           # LangGraph graph builder & compiler
│   │   ├── schemas/
│   │   │   └── complaint.py          # Pydantic v2 validation models
│   │   ├── services/
│   │   │   ├── ai_service.py         # AI domain logic & ICH Q9 risk calculators
│   │   │   └── complaint_service.py  # Complaint persistence & retrieval service
│   │   └── main.py                   # FastAPI application entrypoint & middleware
│   ├── samples/                      # Demonstration complaint test files (PDF, EML, TXT)
│   ├── test_e2e_workflow.py          # 21-step End-to-End workflow integration test
│   ├── test_qa_suite.py              # 18-scenario Senior QA automated test suite
│   ├── test_security_audit.py        # 7-check security & vulnerability test suite
│   ├── requirements.txt              # Python backend dependencies
│   ├── .env.example                  # Environment configuration template
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/               # Modular UI Components (Header, Sidebar, Cards, Tables)
│   │   ├── pages/
│   │   │   ├── IntakePage.tsx        # 2-Column Split Intake Workspace (Log Form + AI Assistant)
│   │   │   ├── DashboardPage.tsx     # QMS Analytics & KPI Dashboard
│   │   │   ├── ComplaintListPage.tsx # Complaint Register table with search & filters
│   │   │   ├── ComplaintDetailsPage.tsx # Detailed audit log & investigation view
│   │   │   └── AIAnalysisPage.tsx    # Standalone AI Copilot analysis workspace
│   │   ├── store/
│   │   │   ├── slices/               # Redux Toolkit Slices (intake, complaints, products)
│   │   │   └── index.ts              # Redux Store configuration
│   │   ├── services/
│   │   │   └── api.ts                # Axios HTTP API client
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interface definitions
│   │   ├── App.tsx                   # Main React application layout
│   │   └── main.tsx                  # React entry point
│   ├── package.json                  # Node dependencies
│   ├── vite.config.ts                # Vite build configuration
│   ├── tailwind.config.js            # Tailwind CSS styling configuration
│   ├── .env.example
│   └── .gitignore
└── README.md                         # Product & Architecture Documentation
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

# Create & activate a virtual environment
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

# Launch the FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*The backend server will start at `http://127.0.0.1:8000`. Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.*

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
*The React frontend will start at `http://localhost:3000`.*

---

## 🧪 Automated Test & Verification Suites

Execute the built-in test suites from the `backend` directory:

```bash
cd backend

# 1. Run the 21-Step End-to-End Workflow Integration Test
python test_e2e_workflow.py

# 2. Run the 18-Scenario Senior QA Engineering Test Suite
python test_qa_suite.py

# 3. Run the 7-Check Security & Vulnerability Test Suite
python test_security_audit.py
```

---

## 🎮 End-to-End Demonstration Workflow

Follow these steps to demonstrate the end-to-end user flow:

1. **Open Intake Page**: Click **Log Customer Complaint** in the sidebar.
2. **Upload Demonstration Document**: Drag & drop `backend/samples/sample_paracetamol_complaint.pdf` into the AI Complaint Intake Assistant dropzone (or click **Paste Complaint Text / Email** and select the Paracetamol sample template).
3. **Automated LangGraph Pipeline Execution**:
   - Extraction progress bar animates from 10% to 100%.
   - LangGraph extracts `Product Name` (*Paracetamol Tablets 500 mg*), `Batch Number` (*PCM240731*), `Market` (*India*), `Quantity Affected` (*15 strips*), and `Complaint Description`.
4. **Form Pre-Population**: The form fields on the left automatically populate with the extracted data for QA review.
5. **AI Assistant Copilot Panel**:
   - Displays completeness score (e.g. `87%`), missing fields alert, duplicate candidate matching alerts, and ICH Q9 Risk Matrix assessment.
6. **Human Verification & Editing**: QA engineer can review or modify any extracted field (e.g., adjust severity or priority).
7. **Save Complaint**: Click **Save Complaint**. The complaint is persisted to PostgreSQL/SQLite and assigned a unique ID (`CMP-2026-XXXX`).
8. **Complaint Register & Audit View**:
   - The user is redirected to the **Complaint Register** table.
   - Click on the new complaint row to view the audit record, risk breakdown, investigation plan, and recommended CAPA.

---

## 🎯 Key Codebase Files for Technical Interviews

When explaining the system during technical interviews, focus on these primary files:

1. **LangGraph Pipeline (`backend/app/graph/workflow.py` & `nodes.py`)**  
   - Demonstrates StateGraph construction, node transitions, typed state updates, and structured Pydantic extraction using Groq LLM.
2. **ICH Q9 Quality Risk Service (`backend/app/services/ai_service.py`)**  
   - Demonstrates domain-specific pharmaceutical risk matrix algorithms ($RPN = S \times P \times D$), duplicate detection algorithms, and completeness scoring.
3. **Security Middleware & Upload Validation (`backend/app/core/security.py` & `main.py`)**  
   - Demonstrates enterprise file validation, prohibited executable restriction, CORS origin restriction, and global exception masking.
4. **React 2-Column Intake Workspace (`frontend/src/pages/IntakePage.tsx`)**  
   - Demonstrates modern React architecture, drag-and-drop ingestion, interactive AI copilot chat interface, and form state synchronization.
5. **Redux Toolkit State Management (`frontend/src/store/slices/intakeSlice.ts` & `complaintsSlice.ts`)**  
   - Demonstrates async thunks, state normalization, and seamless frontend-backend API integration.

---

## 📜 License & Compliance

Developed for pharmaceutical QMS demonstration purposes under **ICH Q9 Quality Risk Management** and **EU GMP Annex 11 / FDA 21 CFR Part 11** guidelines.
