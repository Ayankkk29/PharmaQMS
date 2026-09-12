import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setActiveNavTab } from '../store/slices/complaintsSlice';
import { Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Database, Cpu, Activity } from 'lucide-react';

export const AIAnalysisPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { analysisResult, isAnalyzing, rawInput } = useSelector((state: RootState) => state.intake);

  const nodes = [
    { name: '1. Ingestion & Document Parser', status: 'Completed', detail: 'Cleaned raw text stream' },
    { name: '2. Entity Extraction (gemma2-9b-it)', status: analysisResult ? 'Completed' : (isAnalyzing ? 'Active' : 'Pending'), detail: 'Extracted Product, Batch #, Reporter & Defect' },
    { name: '3. Completeness Evaluator', status: analysisResult ? 'Completed' : 'Pending', detail: 'Evaluated 5 mandatory GMP fields' },
    { name: '4. Duplicate & Quality Classifier', status: analysisResult ? 'Completed' : 'Pending', detail: 'Scanned historical complaint DB' },
    { name: '5. ICH Q9 Risk Assessor (llama-3.3-70b)', status: analysisResult ? 'Completed' : 'Pending', detail: 'Calculated Severity, Probability, Detectability & RPN' },
    { name: '6. CAPA Generator', status: analysisResult ? 'Completed' : 'Pending', detail: 'Generated 24h containment & 5-Whys plan' }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg border border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-sky-500/20 text-sky-300 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-sky-400/30">
              LangGraph StateGraph Visualizer
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-400/30">
              Groq Cloud Infrastructure
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-2 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-sky-400" />
            AI Agent Graph Execution Workflow
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live execution status of the deterministic multi-node LangGraph pipeline. Each node transforms state until pre-filled complaint schema is emitted.
          </p>
        </div>

        <button
          onClick={() => dispatch(setActiveNavTab('log'))}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg shadow transition"
        >
          Run New Analysis
        </button>
      </div>

      {/* Graph Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border transition ${
              node.status === 'Completed'
                ? 'bg-emerald-50/60 border-emerald-200'
                : node.status === 'Active'
                ? 'bg-sky-50 border-sky-300 animate-pulse'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">{node.name}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                node.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : node.status === 'Active'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {node.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-2">{node.detail}</p>
          </div>
        ))}
      </div>

      {/* Output Inspection Card */}
      {analysisResult ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base">StateGraph Pipeline Output Inspection</h3>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96">
            <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
          <Activity className="h-10 w-10 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No Active Analysis Running</p>
          <p className="text-xs text-slate-500">Go to "Log Complaint" to submit customer text or document files.</p>
        </div>
      )}

    </div>
  );
};
