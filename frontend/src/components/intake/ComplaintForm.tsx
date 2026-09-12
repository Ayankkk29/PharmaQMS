import React from 'react';
import { ComplaintSaveRequest, SeverityType } from '../../types';
import { Calendar, RotateCcw, Save, RefreshCw } from 'lucide-react';

interface ComplaintFormProps {
  formValues: Partial<ComplaintSaveRequest>;
  hasResult: boolean;
  isSaving: boolean;
  saveError: string | null;
  onUpdateForm: (fieldValues: Partial<ComplaintSaveRequest>) => void;
  onReset: () => void;
  onSave: (e: React.FormEvent) => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = ({
  formValues: fv,
  hasResult,
  isSaving,
  saveError,
  onUpdateForm,
  onReset,
  onSave,
}) => {
  return (
    <form onSubmit={onSave} className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5 font-sans">
      
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Log Customer Complaint</h1>
          <p className="text-xs text-slate-500 mt-0.5">Pharmaceutical Quality Assurance Intake & Review Form</p>
        </div>
        <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300/80 shadow-2xs">
          Pending Triage
        </span>
      </div>

      {/* 1. ORIGIN & CUSTOMER DETAILS */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>1. ORIGIN & CUSTOMER DETAILS</span>
          {hasResult && <span className="text-[10px] text-sky-600 font-semibold">• AI Extracted</span>}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Complaint Source */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Complaint Source</label>
            <input
              type="text"
              placeholder="Awaiting AI extraction..."
              value={fv.complaint_source || fv.source_type || ''}
              onChange={(e) => onUpdateForm({ complaint_source: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                hasResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
              }`}
            />
          </div>

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Customer Name</label>
            <input
              type="text"
              placeholder="Awaiting AI extraction..."
              value={fv.customer_name || fv.reporter_organization || ''}
              onChange={(e) => onUpdateForm({ customer_name: e.target.value, reporter_organization: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                hasResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
              }`}
            />
          </div>

        </div>
      </div>

      {/* 2. PRODUCT & BATCH IDENTIFICATION */}
      <div className="space-y-2.5 pt-1 border-t border-slate-100">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>2. PRODUCT & BATCH IDENTIFICATION</span>
          {hasResult && <span className="text-[10px] text-sky-600 font-semibold">• AI Extracted</span>}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Product Name</label>
            <input
              type="text"
              placeholder="Awaiting AI extraction..."
              value={fv.product_name_raw || ''}
              onChange={(e) => onUpdateForm({ product_name_raw: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                hasResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
              }`}
            />
          </div>

          {/* Product Strength/Grade */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Product Strength/Grade</label>
            <input
              type="text"
              placeholder="Awaiting AI extraction..."
              value={fv.product_strength || ''}
              onChange={(e) => onUpdateForm({ product_strength: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                hasResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
              }`}
            />
          </div>

          {/* Batch/Lot Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Batch/Lot Number</label>
            <input
              type="text"
              placeholder="Awaiting AI extraction..."
              value={fv.batch_number || ''}
              onChange={(e) => onUpdateForm({ batch_number: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs font-mono font-bold border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                hasResult ? 'bg-sky-50/40 border-sky-300 text-sky-950' : 'bg-slate-50/70 border-slate-200'
              }`}
            />
          </div>

          {/* Manufacturing Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Manufacturing Date</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Awaiting AI extraction..."
                value={fv.manufacturing_date || ''}
                onChange={(e) => onUpdateForm({ manufacturing_date: e.target.value })}
                className={`w-full px-3 py-1.5 pr-8 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                  hasResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                }`}
              />
              <Calendar className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Expiry Date</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Awaiting AI extraction..."
                value={fv.expiry_date || ''}
                onChange={(e) => onUpdateForm({ expiry_date: e.target.value })}
                className={`w-full px-3 py-1.5 pr-8 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                  hasResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                }`}
              />
              <Calendar className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Quantity Affected */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Quantity Affected</label>
            <div className="flex rounded-md overflow-hidden border border-slate-200 bg-slate-50/70">
              <input
                type="text"
                placeholder="Awaiting AI extraction..."
                value={fv.quantity_affected || ''}
                onChange={(e) => onUpdateForm({ quantity_affected: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-medium bg-transparent focus:bg-white focus:outline-none placeholder-slate-400"
              />
              <span className="px-2.5 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold border-l border-slate-200 flex items-center">
                units
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 3. COMPLAINT DETAILS */}
      <div className="space-y-2.5 pt-1 border-t border-slate-100">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>3. COMPLAINT DETAILS</span>
          {hasResult && <span className="text-[10px] text-sky-600 font-semibold">• AI Extracted</span>}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Complaint Type */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Complaint Type</label>
            <input
              type="text"
              placeholder="Awaiting AI extraction..."
              value={fv.complaint_type || fv.defect_category || ''}
              onChange={(e) => onUpdateForm({ complaint_type: e.target.value, defect_category: e.target.value })}
              className={`w-full px-3 py-1.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                hasResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
              }`}
            />
          </div>

          {/* Complaint Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Complaint Date</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Awaiting AI extraction..."
                value={fv.complaint_date || ''}
                onChange={(e) => onUpdateForm({ complaint_date: e.target.value })}
                className={`w-full px-3 py-1.5 pr-8 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                  hasResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                }`}
              />
              <Calendar className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Detailed Complaint Description */}
        <div className="space-y-1 pt-1">
          <label className="text-xs font-bold text-slate-700">Detailed Complaint Description</label>
          <textarea
            rows={3}
            placeholder="Awaiting AI extraction..."
            value={fv.defect_description || ''}
            onChange={(e) => onUpdateForm({ defect_description: e.target.value })}
            className={`w-full p-2.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 leading-relaxed resize-y ${
              hasResult ? 'bg-sky-50/20 border-sky-200' : 'bg-slate-50/70 border-slate-200'
            }`}
          />
        </div>
      </div>

      {/* 4. INITIAL ASSESSMENT & PRIORITY */}
      <div className="space-y-2.5 pt-1 border-t border-slate-100">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>4. INITIAL ASSESSMENT & PRIORITY</span>
          {hasResult && <span className="text-[10px] text-sky-600 font-semibold">• ICH Q9 Evaluated</span>}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Initial Severity */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Initial Severity</label>
            <select
              value={fv.severity || 'MINOR'}
              onChange={(e) => onUpdateForm({ severity: e.target.value as SeverityType })}
              className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              <option value="CRITICAL">CRITICAL</option>
              <option value="MAJOR">MAJOR</option>
              <option value="MINOR">MINOR</option>
            </select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Priority Level</label>
            <select
              value={fv.priority || 'MEDIUM'}
              onChange={(e) => onUpdateForm({ priority: e.target.value })}
              className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
            >
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          <span>Reset Form</span>
        </button>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Persisting Record...</span>
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              <span>Save Complaint</span>
            </>
          )}
        </button>
      </div>

      {saveError && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md font-medium">
          Error saving complaint: {saveError}
        </div>
      )}

    </form>
  );
};
