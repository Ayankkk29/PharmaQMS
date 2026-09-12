import React from 'react';
import { ShieldAlert, AlertTriangle, FileWarning, Sparkles, CheckCircle2, ArrowRight, Zap, UserCheck } from 'lucide-react';
import { RiskAssessment } from '../types';

interface RiskAssessmentCardProps {
  risk: RiskAssessment;
}

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ risk }) => {
  const getRiskBadgeColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'MEDIUM':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'MAJOR':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3 font-sans text-slate-800">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-sky-600" />
          <h3 className="font-bold text-xs tracking-tight text-slate-900">ICH Q9 Quality Risk Assessment</h3>
        </div>
        <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
          <UserCheck className="h-3 w-3 text-sky-600" /> AI-generated assessment — Human review required
        </span>
      </div>

      {/* Primary Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Overall Risk Level:</span>
          <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getRiskBadgeColor(risk.risk_level)} shadow-2xs`}>
            {risk.risk_level || 'MEDIUM'} RISK
          </span>
        </div>

        {risk.regulatory_reportable && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <FileWarning className="h-3.5 w-3.5 mr-1 text-rose-600" /> Potentially Reportable — QA Review Required
          </span>
        )}
      </div>

      {/* Controlled Values Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 font-bold block uppercase text-[9px]">Severity</span>
          <span className={`inline-block mt-0.5 px-2 py-0.5 rounded font-bold text-[11px] border ${getSeverityColor(risk.severity)}`}>
            {risk.severity || 'MINOR'} ({risk.severity_score}/5)
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-bold block uppercase text-[9px]">Probability</span>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded font-bold text-[11px] bg-slate-200/80 text-slate-800 border border-slate-300">
            {risk.probability || 'UNLIKELY'} ({risk.probability_score}/5)
          </span>
        </div>

        <div>
          <span className="text-slate-400 font-bold block uppercase text-[9px]">Detectability</span>
          <span className="inline-block mt-0.5 px-2 py-0.5 rounded font-bold text-[11px] bg-slate-200/80 text-slate-800 border border-slate-300">
            {risk.detectability || 'HIGH'} ({risk.detectability_score}/5)
          </span>
        </div>

        <div className="bg-white p-1.5 rounded border border-slate-200 text-center shadow-2xs">
          <span className="text-[9px] text-sky-700 font-bold uppercase block">RPN Score</span>
          <span className="text-lg font-black text-sky-600 leading-none">{risk.rpn_score || 18}</span>
        </div>
      </div>

      {/* Key Risk Factors Tags */}
      {risk.key_risk_factors && risk.key_risk_factors.length > 0 && (
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-700 block flex items-center">
            <Zap className="h-3 w-3 text-amber-500 mr-1" /> Key Risk Factors:
          </span>
          <div className="flex flex-wrap gap-1">
            {risk.key_risk_factors.map((factor, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Reasoning */}
      <div className="space-y-1">
        <span className="text-[11px] font-bold text-slate-700 block">AI Risk Reasoning:</span>
        <p className="text-xs text-slate-700 bg-sky-50/40 p-2.5 rounded border border-sky-100 leading-relaxed">
          {risk.reasoning || risk.patient_safety_impact || 'Assessed per ICH Q9 Quality Risk Management framework.'}
        </p>
      </div>

      {/* Recommended Next Action */}
      <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-lg space-y-1">
        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
          <ArrowRight className="h-3.5 w-3.5 text-emerald-600" /> Recommended Action:
        </span>
        <p className="text-xs text-emerald-800 font-medium leading-relaxed">
          {risk.recommended_action || 'Quarantine affected batch immediately across all warehouses and initiate 24-hour Site QA containment review.'}
        </p>
      </div>

    </div>
  );
};
