import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchComplaints, fetchAnalyticsSummary } from '../store/slices/complaintsSlice';
import { AnalyticsHeader } from '../components/AnalyticsHeader';
import { ComplaintTable } from '../components/ComplaintTable';
import { ComplaintDetailModal } from '../components/ComplaintDetailModal';
import { LayoutDashboard, RefreshCw } from 'lucide-react';

interface DashboardPageProps {
  onGoToIntake: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onGoToIntake }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchComplaints());
    dispatch(fetchAnalyticsSummary());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchComplaints());
    dispatch(fetchAnalyticsSummary());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      
      {/* Page Title & Quick Actions */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-sky-600" />
            Quality Complaint Management & Audit Register
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            PostgreSQL persistent storage • ICH Q9 Risk Levels • CAPA Action Tracking
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Register</span>
          </button>

          <button
            onClick={onGoToIntake}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow transition"
          >
            + Log New Complaint
          </button>
        </div>
      </div>

      {/* Analytics KPI Header */}
      <AnalyticsHeader />

      {/* Complaint Table List */}
      <ComplaintTable />

      {/* Audit Detail View Modal */}
      <ComplaintDetailModal />

    </div>
  );
};
