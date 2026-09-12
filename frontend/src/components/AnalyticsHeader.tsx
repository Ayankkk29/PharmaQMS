import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { AlertOctagon, CheckCircle2, ShieldAlert, FileSpreadsheet, Pill } from 'lucide-react';

export const AnalyticsHeader: React.FC = () => {
  const analytics = useSelector((state: RootState) => state.complaints.analytics);

  if (!analytics) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      
      {/* Total Complaints */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Complaints</span>
          <span className="text-2xl font-extrabold text-slate-800">{analytics.total_complaints}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            {analytics.api_complaints_count} API / {analytics.fdf_complaints_count} FDF
          </span>
        </div>
        <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
          <FileSpreadsheet className="h-6 w-6" />
        </div>
      </div>

      {/* Critical Severity */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Critical Defects</span>
          <span className="text-2xl font-extrabold text-rose-600">{analytics.critical_complaints}</span>
          <span className="text-[11px] text-rose-500 block mt-0.5">Urgent Investigation</span>
        </div>
        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
          <AlertOctagon className="h-6 w-6" />
        </div>
      </div>

      {/* High Risk Count */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">High ICH Risk</span>
          <span className="text-2xl font-extrabold text-amber-600">{analytics.high_risk_count}</span>
          <span className="text-[11px] text-amber-600 block mt-0.5">ICH Q9 RPN &ge; 25</span>
        </div>
        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
          <ShieldAlert className="h-6 w-6" />
        </div>
      </div>

      {/* Completeness Rate */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Completeness</span>
          <span className="text-2xl font-extrabold text-emerald-600">{analytics.completeness_rate}%</span>
          <span className="text-[11px] text-emerald-600 block mt-0.5">GMP Data Integrity</span>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
          <CheckCircle2 className="h-6 w-6" />
        </div>
      </div>

      {/* Pending CAPAs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Pending CAPAs</span>
          <span className="text-2xl font-extrabold text-indigo-600">{analytics.pending_capas}</span>
          <span className="text-[11px] text-indigo-500 block mt-0.5">Active Containment</span>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
          <Pill className="h-6 w-6" />
        </div>
      </div>

    </div>
  );
};
