import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  setFilterStatus,
  setFilterSeverity,
  setFilterProductType,
  setSearchQuery,
  setSelectedComplaint,
  clearFilters
} from '../store/slices/complaintsSlice';
import { ComplaintResponse } from '../types';
import { Search, Filter, Eye, AlertCircle, Copy, CheckCircle2, ShieldAlert } from 'lucide-react';

export const ComplaintTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items, filters, isLoading } = useSelector((state: RootState) => state.complaints);

  const filteredItems = items.filter((c) => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.severity && c.severity !== filters.severity) return false;
    if (filters.productType && c.product_type !== filters.productType) return false;
    
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchNum = c.complaint_number.toLowerCase().includes(q);
      const matchBatch = c.batch_number?.toLowerCase().includes(q) || false;
      const matchProd = c.product_name_raw?.toLowerCase().includes(q) || false;
      const matchReporter = c.reporter_name?.toLowerCase().includes(q) || false;
      if (!matchNum && !matchBatch && !matchProd && !matchReporter) return false;
    }
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">🔴 CRITICAL</span>;
      case 'MAJOR':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">🟡 MAJOR</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">🟢 MINOR</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLOSED':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Closed</span>;
      case 'CAPA_PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">CAPA Pending</span>;
      case 'UNDER_INVESTIGATION':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800">Investigating</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Logged</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
      
      {/* Filter & Search Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Complaint #, Batch, Product, Reporter..."
            value={filters.searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center space-x-2">
          
          {/* Product Type Filter */}
          <select
            value={filters.productType}
            onChange={(e) => dispatch(setFilterProductType(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-sky-500"
          >
            <option value="">All Categories (API & FDF)</option>
            <option value="API">API (Active Ingredient)</option>
            <option value="FDF">FDF (Finished Dosage Form)</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={(e) => dispatch(setFilterSeverity(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-sky-500"
          >
            <option value="">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="MAJOR">Major Only</option>
            <option value="MINOR">Minor Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => dispatch(setFilterStatus(e.target.value))}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium focus:ring-1 focus:ring-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="LOGGED">Logged</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="CAPA_PENDING">CAPA Pending</option>
            <option value="CLOSED">Closed</option>
          </select>

          {(filters.status || filters.severity || filters.productType || filters.searchQuery) && (
            <button
              onClick={() => dispatch(clearFilters())}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold px-2 py-1"
            >
              Reset
            </button>
          )}

        </div>

      </div>

      {/* Complaints Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Complaint #</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Batch / Lot</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">ICH Q9 Risk</th>
              <th className="py-3 px-4">Completeness</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                  Loading PostgreSQL Complaints...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500 font-medium">
                  No complaints found matching the selected criteria.
                </td>
              </tr>
            ) : (
              filteredItems.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  
                  {/* Complaint Number */}
                  <td className="py-3 px-4 font-bold text-sky-700">
                    <div className="flex items-center space-x-1.5">
                      <span>{c.complaint_number}</span>
                      {c.is_potential_duplicate && (
                        <span title="Potential Duplicate" className="text-rose-500">
                          <Copy className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Product Category (API vs FDF) */}
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      c.product_type === 'API' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {c.product_type || 'FDF'}
                    </span>
                  </td>

                  {/* Product Name */}
                  <td className="py-3 px-4 font-medium text-slate-800 max-w-[200px] truncate" title={c.product_name_raw || ''}>
                    {c.product_name_raw || 'Unspecified Product'}
                  </td>

                  {/* Batch Number */}
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    {c.batch_number || <span className="text-slate-400 italic">Missing</span>}
                  </td>

                  {/* Severity */}
                  <td className="py-3 px-4">
                    {getSeverityBadge(c.severity)}
                  </td>

                  {/* Risk Level */}
                  <td className="py-3 px-4 font-semibold">
                    {c.risk_assessment ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.risk_assessment.risk_level === 'HIGH'
                          ? 'bg-rose-500 text-white'
                          : c.risk_assessment.risk_level === 'MEDIUM'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        RPN {c.risk_assessment.rpn_score} ({c.risk_assessment.risk_level})
                      </span>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>

                  {/* Completeness */}
                  <td className="py-3 px-4">
                    {c.is_complete ? (
                      <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> 100% Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-600 font-semibold text-[11px]">
                        <AlertCircle className="h-3.5 w-3.5 mr-1" /> {c.missing_fields.length} Missing
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    {getStatusBadge(c.status)}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => dispatch(setSelectedComplaint(c))}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 font-semibold text-xs transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Audit Detail</span>
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
