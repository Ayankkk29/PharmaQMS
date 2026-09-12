import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setSelectedComplaint } from '../store/slices/complaintsSlice';
import { RiskAssessmentCard } from './RiskAssessmentCard';
import { CapaCard } from './CapaCard';
import { X, FileText, User, Building2, Calendar, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

export const ComplaintDetailModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedComplaint = useSelector((state: RootState) => state.complaints.selectedComplaint);

  if (!selectedComplaint) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-slate-900 text-white px-6 py-4 flex items-center justify-between z-10 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold tracking-tight text-white">{selectedComplaint.complaint_number}</h2>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                selectedComplaint.product_type === 'API' ? 'bg-sky-500 text-white' : 'bg-emerald-500 text-white'
              }`}>
                {selectedComplaint.product_type || 'FDF'}
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded border border-slate-700">
                {selectedComplaint.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">GMP Audit Record & Quality File</p>
          </div>

          <button
            onClick={() => dispatch(setSelectedComplaint(null))}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block">Product Name:</span>
              <span className="font-bold text-slate-800">{selectedComplaint.product_name_raw || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Lot / Batch #:</span>
              <span className="font-mono font-bold text-slate-800">{selectedComplaint.batch_number || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Reporter / Org:</span>
              <span className="font-medium text-slate-800">{selectedComplaint.reporter_name || 'Customer'} ({selectedComplaint.reporter_organization || 'QMS'})</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">Intake Date:</span>
              <span className="font-medium text-slate-800">{selectedComplaint.complaint_date || 'N/A'}</span>
            </div>
          </div>

          {/* Original Raw Complaint Input */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block flex items-center">
              <FileText className="h-4 w-4 mr-1 text-sky-600" /> Raw Intake Content ({selectedComplaint.source_type})
            </span>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono whitespace-pre-wrap border border-slate-800 max-h-40 overflow-y-auto">
              {selectedComplaint.raw_content}
            </div>
          </div>

          {/* Extracted Defect Summary */}
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Defect Analysis & Summary</span>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed">
              {selectedComplaint.defect_description}
            </div>
          </div>

          {/* Duplicate Alert if applicable */}
          {selectedComplaint.is_potential_duplicate && (
            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs text-rose-800">
              <span className="font-bold block">⚠️ Duplicate Complaint Cross-Reference:</span>
              <span>{selectedComplaint.duplicate_reason}</span>
            </div>
          )}

          {/* Risk Assessment */}
          {selectedComplaint.risk_assessment && (
            <RiskAssessmentCard risk={selectedComplaint.risk_assessment} />
          )}

          {/* CAPA Recommendations */}
          {selectedComplaint.capa_recommendations && (
            <CapaCard capa={selectedComplaint.capa_recommendations} />
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => dispatch(setSelectedComplaint(null))}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-lg transition"
          >
            Close Audit View
          </button>
        </div>

      </div>
    </div>
  );
};
