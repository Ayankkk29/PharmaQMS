import React from 'react';
import { ClipboardList, CheckSquare, Search, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
import { CapaRecommendation } from '../types';

interface CapaCardProps {
  capa: CapaRecommendation;
}

export const CapaCard: React.FC<CapaCardProps> = ({ capa }) => {
  const containment = capa.immediate_containment || capa.containment_actions || [];
  const corrective = capa.corrective_action || capa.recommended_capa || '';
  const preventive = capa.preventive_action || '';
  const investigationPlan = capa.root_cause_investigation_plan || [];

  return (
    <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="bg-slate-900 text-white -mx-5 -mt-5 p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <h3 className="font-bold text-sm tracking-wide text-white">⭐ AI CAPA Recommendations</h3>
        </div>
        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1">
          <UserCheck className="h-3 w-3" /> Human Review Required
        </span>
      </div>

      {/* 1. Immediate Containment Actions */}
      <div>
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
          <CheckSquare className="h-4 w-4 mr-1 text-emerald-600" /> 🛑 Immediate Containment (24h Hold)
        </h4>
        <ul className="space-y-1.5 pl-2">
          {containment.map((action, idx) => (
            <li key={idx} className="text-xs text-slate-700 flex items-start space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 2. Corrective Action & Preventive Action */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        
        {/* Corrective Action */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-xs font-bold text-indigo-950 block">🛠️ Corrective Action (CAPA):</span>
          <p className="text-xs text-slate-700 leading-relaxed">{corrective}</p>
        </div>

        {/* Preventive Action */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-xs font-bold text-indigo-950 block">🛡️ Preventive Action:</span>
          <p className="text-xs text-slate-700 leading-relaxed">{preventive}</p>
        </div>

      </div>

      {/* 3. 5-Whys Root Cause Investigation Plan */}
      {investigationPlan.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center">
            <Search className="h-4 w-4 mr-1 text-indigo-600" /> 🔍 5-Whys Root Cause Investigation Roadmap
          </h4>
          <div className="space-y-1.5 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100">
            {investigationPlan.map((step, idx) => (
              <div key={idx} className="text-xs text-indigo-950 flex items-start space-x-2">
                <ArrowRight className="h-3.5 w-3.5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-500 italic text-right pt-1">
        * QA Manager Sign-off: All CAPA recommendations require human review prior to SOP execution.
      </p>

    </div>
  );
};
