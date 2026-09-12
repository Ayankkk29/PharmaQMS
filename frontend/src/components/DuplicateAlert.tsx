import React from 'react';
import { Copy, AlertCircle, Sparkles, UserCheck } from 'lucide-react';
import { DuplicateInfo } from '../types';

interface DuplicateAlertProps {
  duplicateInfo: DuplicateInfo;
}

export const DuplicateAlert: React.FC<DuplicateAlertProps> = ({ duplicateInfo }) => {
  const isDuplicate = duplicateInfo.possible_duplicate || duplicateInfo.is_potential_duplicate;
  if (!isDuplicate) return null;

  const confidencePct = Math.round((duplicateInfo.confidence || duplicateInfo.similarity_score || 0.8) * 100);
  const matchingIds = duplicateInfo.matching_complaint_ids || (duplicateInfo.duplicate_of_number ? [duplicateInfo.duplicate_of_number] : []);
  const reasoning = duplicateInfo.similarity_reasoning || duplicateInfo.duplicate_reason || 'Matching batch number or defect pattern found in historical complaints.';

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-3 shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
            <Copy className="h-4 w-4" />
          </div>
          <h4 className="font-bold text-sm text-rose-950 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-rose-600 animate-pulse" />
            ⭐ AI Duplicate Complaint Candidate Identified
          </h4>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-rose-200 text-rose-800">
            {confidencePct}% Confidence
          </span>
          <span className="text-[10px] bg-rose-200 text-rose-900 font-extrabold px-2.5 py-0.5 rounded flex items-center gap-1">
            <UserCheck className="h-3 w-3" /> Human Review Required
          </span>
        </div>
      </div>

      {/* Similarity Reasoning */}
      <p className="text-xs text-rose-800 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-rose-200/60">
        {reasoning}
      </p>

      {/* Matching Complaint IDs */}
      {matchingIds.length > 0 && (
        <div className="flex items-center space-x-2 text-xs">
          <span className="font-bold text-rose-900">Matching Historical Complaint Records:</span>
          <div className="flex flex-wrap gap-1.5">
            {matchingIds.map((id) => (
              <span key={id} className="font-mono font-bold text-xs bg-rose-200 text-rose-950 px-2 py-0.5 rounded">
                {id}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-rose-700 italic">
        * Note: AI recommendation only. Complaint is preserved for manual QA decision and will not be automatically rejected.
      </p>

    </div>
  );
};
