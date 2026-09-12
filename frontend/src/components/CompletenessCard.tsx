import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { CompletenessInfo } from '../types';

interface CompletenessCardProps {
  completeness: CompletenessInfo;
}

export const CompletenessCard: React.FC<CompletenessCardProps> = ({ completeness }) => {
  const [showQuestions, setShowQuestions] = useState(false);
  const { is_complete, completeness_percentage, completeness_score, missing_fields, warnings, suggested_follow_up_questions } = completeness;

  const score = completeness_percentage ?? completeness_score ?? 0;
  const questions = suggested_follow_up_questions || [];
  const warningList = warnings || [];

  return (
    <div className={`p-5 rounded-xl border transition shadow-sm ${
      is_complete ? 'bg-emerald-50/70 border-emerald-200' : 'bg-amber-50/80 border-amber-200'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {is_complete ? (
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-6 w-6 flex-shrink-0" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
            </div>
          )}
          <div>
            <div className="flex items-center space-x-2">
              <h4 className={`font-bold text-sm ${is_complete ? 'text-emerald-950' : 'text-amber-950'}`}>
                {is_complete ? '⭐ Complaint Information Complete' : '⭐ Missing Information Detected'}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                is_complete ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-900'
              }`}>
                {is_complete ? 'GMP Ready' : 'Follow-up Recommended'}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${is_complete ? 'text-emerald-800' : 'text-amber-800'}`}>
              {is_complete
                ? 'All mandatory regulatory intake fields are present.'
                : `${missing_fields.length} key processing field(s) require complainant follow-up.`}
            </p>
          </div>
        </div>

        {/* Score Percentage Gauge */}
        <div className="text-right bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
          <span className={`text-2xl font-black ${is_complete ? 'text-emerald-700' : 'text-amber-700'}`}>
            {score}%
          </span>
          <p className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold block">Completeness</p>
        </div>
      </div>

      {/* Warnings Banner */}
      {warningList.length > 0 && (
        <div className="mt-3 bg-amber-100/70 p-3 rounded-lg border border-amber-200 space-y-1">
          <span className="text-xs font-bold text-amber-900 flex items-center">
            <Info className="h-3.5 w-3.5 mr-1 text-amber-700" /> Validation Warnings:
          </span>
          <ul className="space-y-1 pl-4 list-disc text-xs text-amber-800">
            {warningList.map((warn, idx) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Field Badges */}
      {!is_complete && missing_fields.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {missing_fields.map((field) => (
              <span
                key={field}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300"
              >
                Missing: {field.replace('_', ' ')}
              </span>
            ))}
          </div>

          {questions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowQuestions(!showQuestions)}
              className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 bg-white px-3 py-1 rounded border border-slate-200 shadow-xs transition"
            >
              <HelpCircle className="h-3.5 w-3.5 text-sky-600" />
              <span>{questions.length} Follow-up Questions</span>
              {showQuestions ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}

      {/* Expandable Suggested Follow-up Questions */}
      {showQuestions && questions.length > 0 && (
        <div className="mt-3 bg-sky-50/90 p-4 rounded-xl border border-sky-200 space-y-2 text-xs">
          <span className="font-bold text-sky-900 block flex items-center gap-1">
            <HelpCircle className="h-4 w-4 text-sky-600" /> AI Suggested Follow-up Questions for Complainant:
          </span>
          <ul className="space-y-1.5 pl-2">
            {questions.map((q, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-sky-950">
                <span className="font-bold text-sky-600 font-mono">{idx + 1}.</span>
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
