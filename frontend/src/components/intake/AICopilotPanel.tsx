import React, { useState } from 'react';
import { AnalysisPipelineResult } from '../../types';
import { CompletenessCard } from '../CompletenessCard';
import { DuplicateAlert } from '../DuplicateAlert';
import { RiskAssessmentCard } from '../RiskAssessmentCard';
import { CapaCard } from '../CapaCard';
import {
  Sparkles,
  Upload,
  FileText,
  Info,
  Send,
  RefreshCw,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Copy,
  ClipboardList
} from 'lucide-react';

interface AICopilotPanelProps {
  isAnalyzing: boolean;
  analysisResult: AnalysisPipelineResult | null;
  selectedFile: File | null;
  rawInput: string;
  chatQuery: string;
  chatHistory: Array<{ sender: 'user' | 'ai'; text: string }>;
  sampleTemplates: Array<{ title: string; type: string; content: string }>;
  onFileUpload: (file: File) => void;
  onFileDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onOpenPasteModal: () => void;
  onLoadSample: (sample: any) => void;
  onChatQueryChange: (q: string) => void;
  onChatSend: (e: React.FormEvent) => void;
}

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({
  isAnalyzing,
  analysisResult,
  selectedFile,
  chatQuery,
  chatHistory,
  sampleTemplates,
  onFileUpload,
  onFileDrop,
  onOpenPasteModal,
  onLoadSample,
  onChatQueryChange,
  onChatSend,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'analysis' | 'risk' | 'duplicate' | 'capa'>('all');
  const progressPercent = isAnalyzing ? 65 : (analysisResult ? 100 : 0);

  return (
    <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 sticky top-20 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-sky-600" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900">QMS AI Copilot</h2>
        </div>
        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
          AI-assisted Operations
        </span>
      </div>

      {/* STATE 1: EMPTY (Before Upload) */}
      {!isAnalyzing && !analysisResult && (
        <div className="space-y-4">
          {/* Drag & Drop File Box */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onFileDrop}
            className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-5 text-center space-y-2 bg-slate-50/50 transition cursor-pointer"
          >
            <Upload className="h-7 w-7 text-slate-400 mx-auto" />
            <p className="text-xs font-bold text-slate-700">
              Drag & drop complaint document here
            </p>
            <p className="text-[11px] text-slate-500">
              or <label htmlFor="file-input-panel" className="text-sky-600 hover:underline font-bold cursor-pointer">browse file</label>
            </p>
            <input
              type="file"
              id="file-input-panel"
              accept=".pdf,.txt,.doc,.docx,.eml"
              onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])}
              className="hidden"
            />
            {selectedFile && (
              <p className="text-xs font-mono font-bold text-sky-600 pt-1">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>

          {/* OR Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2.5 text-[9px] font-bold text-slate-400 tracking-wider uppercase absolute">
              OR
            </span>
          </div>

          {/* Paste Complaint Text / Email Button */}
          <button
            type="button"
            onClick={onOpenPasteModal}
            className="w-full py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition"
          >
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span>Paste Complaint Text / Email</span>
          </button>

          {/* Supported Formats Notice */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-2.5 text-xs text-slate-700">
            <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Supported formats: PDF, EML, TXT, DOCX</p>
              <p className="text-[10px] text-slate-500">Max upload limit: 10MB per document</p>
            </div>
          </div>

          {/* Quick Sample Demo Shortcuts */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Quick Demo Sample Templates:</span>
            <div className="space-y-1.5">
              {sampleTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onLoadSample(tmpl)}
                  className="w-full text-left p-2.5 bg-sky-50/60 hover:bg-sky-50 border border-sky-100 hover:border-sky-200 rounded-lg transition text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-sky-900 truncate">{tmpl.title}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-200/60 text-sky-800 shrink-0">{tmpl.type}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* STATE 2: PROCESSING (During Extraction) */}
      {isAnalyzing && (
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[10px] uppercase tracking-wider text-slate-400">LANGGRAPH PIPELINE PROCESSING</span>
            <span className="text-sky-600 font-mono">{progressPercent}%</span>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-sky-600 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center space-x-2 text-emerald-700 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>1. Document received & content parsed</span>
            </div>
            <div className="flex items-center space-x-2 text-sky-700 font-bold animate-pulse">
              <RefreshCw className="h-4 w-4 animate-spin text-sky-600" />
              <span>2. Extracting entity & batch parameters...</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <span>3. Evaluating mandatory field completeness...</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <span>4. Computing ICH Q9 risk matrix & RPN score...</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <span>5. Cross-checking database for batch duplicates...</span>
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: COMPLETE (Collapsible / Tabbed Analysis Workspace) */}
      {analysisResult && !isAnalyzing && (
        <div className="space-y-3">
          
          {/* Quick Filter Navigation Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition shrink-0 ${
                activeSection === 'all' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Sections
            </button>
            <button
              onClick={() => setActiveSection('analysis')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition shrink-0 ${
                activeSection === 'analysis' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Analysis ({analysisResult.completeness.completeness_percentage}%)
            </button>
            <button
              onClick={() => setActiveSection('risk')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition shrink-0 ${
                activeSection === 'risk' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Risk ({analysisResult.risk_assessment.risk_level})
            </button>
            <button
              onClick={() => setActiveSection('duplicate')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition shrink-0 ${
                activeSection === 'duplicate' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Duplicates
            </button>
            <button
              onClick={() => setActiveSection('capa')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition shrink-0 ${
                activeSection === 'capa' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              CAPA
            </button>
          </div>

          {/* Analysis Cards Container */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {(activeSection === 'all' || activeSection === 'analysis') && (
              <CompletenessCard completeness={analysisResult.completeness} />
            )}
            
            {(activeSection === 'all' || activeSection === 'duplicate') && (
              <DuplicateAlert duplicateInfo={analysisResult.duplicate_info} />
            )}

            {(activeSection === 'all' || activeSection === 'risk') && (
              <RiskAssessmentCard risk={analysisResult.risk_assessment} />
            )}

            {(activeSection === 'all' || activeSection === 'capa') && (
              <CapaCard capa={analysisResult.capa_recommendations} />
            )}
          </div>

          {/* Chat History */}
          {chatHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`p-2 rounded-lg text-xs ${msg.sender === 'user' ? 'bg-slate-100 text-slate-900 ml-4 text-right' : 'bg-sky-50 border border-sky-100 text-slate-800 mr-4'}`}>
                  <span className="font-bold block text-[9px] text-slate-400 mb-0.5">{msg.sender === 'user' ? 'You' : 'AI Copilot'}</span>
                  {msg.text}
                </div>
              ))}
            </div>
          )}

          {/* Interactive Chat Input Bar */}
          <form onSubmit={onChatSend} className="space-y-1 pt-1 border-t border-slate-100">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask AI Copilot about this complaint..."
                value={chatQuery}
                onChange={(e) => onChatQueryChange(e.target.value)}
                className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                className="absolute right-1 bg-sky-600 hover:bg-sky-500 text-white p-1 rounded-md transition"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
            <p className="text-[9px] text-slate-400 text-center italic">
              AI-generated assessment — Human review required
            </p>
          </form>

        </div>
      )}

    </div>
  );
};
