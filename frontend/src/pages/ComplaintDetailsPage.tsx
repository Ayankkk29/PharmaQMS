import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setActiveNavTab, fetchComplaints } from '../store/slices/complaintsSlice';
import { RiskAssessmentCard } from '../components/RiskAssessmentCard';
import { CapaCard } from '../components/CapaCard';
import { FileText, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, Building2, User, Calendar, Tag, Copy } from 'lucide-react';

export const ComplaintDetailsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedComplaint = useSelector((state: RootState) => state.complaints.selectedComplaint);

  useEffect(() => {
    if (!selectedComplaint) {
      dispatch(fetchComplaints());
    }
  }, [dispatch, selectedComplaint]);

  if (!selectedComplaint) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <FileText className="h-12 w-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">No Complaint Selected for Audit View</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please select a complaint record from the Complaint Register to view full 21 CFR Part 211 audit details.
        </p>
        <button
          onClick={() => dispatch(setActiveNavTab('list'))}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg transition"
        >
          Go to Complaint Register
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => dispatch(setActiveNavTab('list'))}
          className="flex items-center space-x-1.5 text-xs font-semibold text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Complaint Register</span>
        </button>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Audit Log ID: {selectedComplaint.id}</span>
        </div>
      </div>

      {/* Record Header Card */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">{selectedComplaint.complaint_number}</h1>
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
              selectedComplaint.product_type === 'API' ? 'bg-sky-500 text-white' : 'bg-emerald-500 text-white'
            }`}>
              {selectedComplaint.product_type || 'FDF'}
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2.5 py-0.5 rounded border border-slate-700">
              Status: {selectedComplaint.status}
            </span>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Created: {selectedComplaint.created_at ? new Date(selectedComplaint.created_at).toLocaleString() : 'N/A'}
          </span>
        </div>

        <p className="text-xs text-slate-300">
          GMP Compliant Customer Complaint Master Record • Product: <span className="font-semibold text-white">{selectedComplaint.product_name_raw || 'Unspecified'}</span>
        </p>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div>
          <span className="text-slate-500 font-semibold block flex items-center gap-1">
            <Tag className="h-3.5 w-3.5 text-sky-600" /> Product Name:
          </span>
          <span className="font-bold text-slate-800 mt-0.5 block">{selectedComplaint.product_name_raw || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block">Lot / Batch Number:</span>
          <span className="font-mono font-bold text-slate-800 mt-0.5 block">{selectedComplaint.batch_number || 'N/A'}</span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-sky-600" /> Complainant & Org:
          </span>
          <span className="font-medium text-slate-800 mt-0.5 block">
            {selectedComplaint.reporter_name || 'Customer'} ({selectedComplaint.reporter_organization || 'QMS'})
          </span>
        </div>
        <div>
          <span className="text-slate-500 font-semibold block flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-sky-600" /> Intake / Event Date:
          </span>
          <span className="font-medium text-slate-800 mt-0.5 block">
            {selectedComplaint.complaint_date} / {selectedComplaint.event_date}
          </span>
        </div>
      </div>

      {/* Side-by-side Raw vs Extracted */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Raw Input */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-sky-600" /> Original Intake Raw Text ({selectedComplaint.source_type})
          </h3>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap border border-slate-800 min-h-[160px] max-h-64 overflow-y-auto">
            {selectedComplaint.raw_content}
          </div>
        </div>

        {/* Right: AI Extracted Defect Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Quality Defect Categorization & Summary
          </h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 min-h-[160px] leading-relaxed space-y-2">
            <div>
              <span className="font-semibold text-slate-900">Category: </span>
              <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold">{selectedComplaint.defect_category || 'Quality Defect'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900">Initial Severity: </span>
              <span className="font-bold">{selectedComplaint.severity}</span>
            </div>
            <p className="text-slate-600 pt-1">{selectedComplaint.defect_description}</p>
          </div>
        </div>

      </div>

      {/* Duplicate Alert if applicable */}
      {selectedComplaint.is_potential_duplicate && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-900 flex items-start space-x-3">
          <Copy className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Duplicate Complaint Cross-Reference Alert</h4>
            <p className="mt-0.5">{selectedComplaint.duplicate_reason}</p>
          </div>
        </div>
      )}

      {/* Risk Assessment Panel */}
      {selectedComplaint.risk_assessment && (
        <RiskAssessmentCard risk={selectedComplaint.risk_assessment} />
      )}

      {/* CAPA Recommendations Panel */}
      {selectedComplaint.capa_recommendations && (
        <CapaCard capa={selectedComplaint.capa_recommendations} />
      )}

    </div>
  );
};
