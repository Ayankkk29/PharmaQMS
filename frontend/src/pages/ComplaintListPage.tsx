import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  fetchComplaints,
  setActiveNavTab,
  setSelectedComplaint
} from '../store/slices/complaintsSlice';
import { ComplaintTable } from '../components/ComplaintTable';
import { ListFilter, Plus, RefreshCw } from 'lucide-react';

export const ComplaintListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchComplaints());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ListFilter className="h-6 w-6 text-sky-600" />
            Customer Complaint Register & Master Index
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            21 CFR Part 211.198 Compliant Complaint Records • API Drug Substances & Finished Dosage Forms
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-sm transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Index</span>
          </button>

          <button
            onClick={() => dispatch(setActiveNavTab('log'))}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow transition"
          >
            <Plus className="h-4 w-4" />
            <span>Log New Complaint</span>
          </button>
        </div>
      </div>

      {/* Complaint Table Component */}
      <ComplaintTable />

    </div>
  );
};
