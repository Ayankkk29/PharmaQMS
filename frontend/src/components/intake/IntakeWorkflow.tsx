import React from 'react';

interface IntakeWorkflowProps {
  isAnalyzing: boolean;
  hasResult: boolean;
  isSaving: boolean;
}

export const IntakeWorkflow: React.FC<IntakeWorkflowProps> = ({
  isAnalyzing,
  hasResult,
  isSaving,
}) => {
  return (
    <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xs border border-slate-800 flex items-center justify-between overflow-x-auto text-xs font-sans">
      
      {/* Step 1 */}
      <div className="flex items-center space-x-2 min-w-max">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
          !hasResult && !isAnalyzing ? 'bg-sky-500 text-white ring-4 ring-sky-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>1</div>
        <span className={!hasResult && !isAnalyzing ? 'font-bold text-sky-400' : 'text-slate-400'}>1. Document Intake</span>
      </div>
      
      <div className="h-[1px] w-6 bg-slate-800 hidden sm:block" />

      {/* Step 2 */}
      <div className="flex items-center space-x-2 min-w-max">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
          isAnalyzing ? 'bg-sky-500 text-white ring-4 ring-sky-500/20 animate-pulse' : (hasResult ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700')
        }`}>2</div>
        <span className={isAnalyzing ? 'font-bold text-sky-400' : (hasResult ? 'text-emerald-400 font-semibold' : 'text-slate-400')}>2. AI Analysis</span>
      </div>

      <div className="h-[1px] w-6 bg-slate-800 hidden sm:block" />

      {/* Step 3 */}
      <div className="flex items-center space-x-2 min-w-max">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
          hasResult && !isSaving ? 'bg-sky-500 text-white ring-4 ring-sky-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>3</div>
        <span className={hasResult && !isSaving ? 'font-bold text-sky-400' : 'text-slate-400'}>3. Human QA Review</span>
      </div>

      <div className="h-[1px] w-6 bg-slate-800 hidden sm:block" />

      {/* Step 4 */}
      <div className="flex items-center space-x-2 min-w-max">
        <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
          isSaving ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 animate-spin' : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>4</div>
        <span className={isSaving ? 'font-bold text-emerald-400' : 'text-slate-400'}>4. Logged to QMS</span>
      </div>

    </div>
  );
};
