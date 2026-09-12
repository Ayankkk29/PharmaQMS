import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setActiveNavTab, setSearchQuery } from '../store/slices/complaintsSlice';
import { Pill, Search, ShieldCheck, Sparkles, Building2 } from 'lucide-react';

export const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const activeNavTab = useSelector((state: RootState) => state.complaints.activeNavTab);
  const searchQuery = useSelector((state: RootState) => state.complaints.filters.searchQuery);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Branding */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => dispatch(setActiveNavTab('dashboard'))}
          >
            <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-sm shadow-sky-500/30">
              <Pill className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-white">AIVOA QMS</span>
                <span className="text-[9px] bg-sky-500/20 text-sky-300 font-bold px-1.5 py-0.5 rounded border border-sky-500/30">
                  AI Copilot
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">AI-Powered Quality Operations</p>
            </div>
          </div>



          {/* Quick Search */}
          <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
            <div className="relative w-full">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2" />
              <input
                type="text"
                placeholder="Search complaints by batch or ID..."
                value={searchQuery}
                onChange={(e) => {
                  dispatch(setSearchQuery(e.target.value));
                  if (activeNavTab !== 'list') dispatch(setActiveNavTab('list'));
                }}
                className="w-full pl-8 pr-3 py-1 text-xs bg-slate-800/90 border border-slate-700 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center space-x-3">
            {activeNavTab !== 'log' && (
              <button
                onClick={() => dispatch(setActiveNavTab('log'))}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-200" />
                <span>+ Log Complaint</span>
              </button>
            )}
            
            <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400 border-l border-slate-800 pl-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-medium">Pharmaceutical Quality Operations</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
