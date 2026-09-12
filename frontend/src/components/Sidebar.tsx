import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setActiveNavTab } from '../store/slices/complaintsSlice';
import { NavTab } from '../types';
import {
  LayoutDashboard,
  FilePlus2,
  Sparkles,
  ListFilter,
  FileSearch,
  ShieldCheck,
  Building2,
  Database
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeNavTab = useSelector((state: RootState) => state.complaints.activeNavTab);
  const selectedComplaint = useSelector((state: RootState) => state.complaints.selectedComplaint);

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'dashboard', label: 'QMS Dashboard', icon: LayoutDashboard },
    { id: 'log', label: 'Log Complaint', icon: FilePlus2, badge: 'AI Copilot' },
    { id: 'analysis', label: 'Copilot Workspace', icon: Sparkles },
    { id: 'list', label: 'Complaint Register', icon: ListFilter },
    { id: 'detail', label: 'Audit Details', icon: FileSearch, badge: selectedComplaint ? 'Active' : undefined },
  ];

  return (
    <aside className="w-60 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col justify-between hidden md:flex shrink-0 min-h-[calc(100vh-3.5rem)]">
      <div className="p-3.5 space-y-5">
        
        {/* Unit Info */}
        <div className="bg-slate-800/70 rounded-lg p-3 border border-slate-700/60">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-sky-400 shrink-0" />
            <span className="text-xs font-bold text-white tracking-wide uppercase">Site QA Unit #04</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">API & FDF Operations</p>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2.5 block mb-1.5">
            Quality Navigation
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => dispatch(setActiveNavTab(item.id))}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-sky-400 border border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Footer System Specs */}
      <div className="p-3.5 border-t border-slate-800 text-[10px] space-y-1.5">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3 text-sky-400" /> Database
          </span>
          <span className="font-mono text-emerald-400 font-bold">PostgreSQL / SQLite</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-sky-400" /> Guidance
          </span>
          <span className="font-mono text-sky-400 font-bold">ICH Q9 / EU GMP</span>
        </div>
      </div>
    </aside>
  );
};
