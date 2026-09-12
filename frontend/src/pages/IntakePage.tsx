import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  setRawInput,
  setInputType,
  setSelectedFile,
  analyzeComplaintText,
  analyzeComplaintFile,
  resetIntake,
  updateFormValues,
  submitComplaint
} from '../store/slices/intakeSlice';
import { fetchComplaints, fetchAnalyticsSummary } from '../store/slices/complaintsSlice';
import { CompletenessCard } from '../components/CompletenessCard';
import { DuplicateAlert } from '../components/DuplicateAlert';
import { RiskAssessmentCard } from '../components/RiskAssessmentCard';
import { CapaCard } from '../components/CapaCard';
import { SeverityType, ComplaintSaveRequest } from '../types';
import {
  Sparkles,
  Upload,
  FileText,
  RotateCcw,
  Save,
  Calendar,
  Info,
  Bot,
  Send,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Clock
} from 'lucide-react';

interface IntakePageProps {
  onSavedSuccess: () => void;
}

const SAMPLE_TEMPLATES = [
  {
    title: 'Paracetamol Tablets 500mg Complaint',
    type: 'TEXT',
    content: `Customer Complaint
Product: Paracetamol Tablets 500 mg
Product Code: PCM500
Batch Number: PCM240731
Market: India
Customer: ABC Healthcare Distribution
Complaint Date: 12 September 2026

The customer reported that several tablets from Batch PCM240731 appeared discolored compared with previous batches.
Approximately 15 strips were identified with the issue.
No adverse event has been reported at this time.
The customer has retained samples and requested an investigation.`
  },
  {
    title: 'Metformin API Yellow Specks Email',
    type: 'EMAIL',
    content: `From: qc@apexgenerics.com
To: qms@pharmamanufacturer.com
Subject: Defect Report - Metformin Hydrochloride API Batch B-MET-8841

Customer Name: Apex Generics QC
Complaint Source: Email Intake
Product: Metformin Hydrochloride API
Batch Number: B-MET-8841
Market: US Commercial Bulk
Complaint Date: 2026-09-01

Yellowish specks detected in bulk drum #4. Dissolution testing showed 12% delay. Quantity affected: 100 kg drum.`
  }
];

export const IntakePage: React.FC<IntakePageProps> = ({ onSavedSuccess }) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    rawInput,
    inputType,
    selectedFile,
    isAnalyzing,
    analysisResult,
    formValues,
    isSaving,
    saveError,
  } = useSelector((state: RootState) => state.intake);

  const [showPasteModal, setShowPasteModal] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([]);

  const fv = formValues || ({} as Partial<ComplaintSaveRequest>);
  const progressPercent = isAnalyzing ? 65 : (analysisResult ? 100 : 0);

  const handleFileUpload = (file: File) => {
    dispatch(setSelectedFile(file));
    dispatch(analyzeComplaintFile(file));
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleTextSubmit = () => {
    if (!rawInput.trim()) return;
    setShowPasteModal(false);
    dispatch(analyzeComplaintText({ content: rawInput, sourceType: inputType }));
  };

  const handleLoadSample = (sample: typeof SAMPLE_TEMPLATES[0]) => {
    dispatch(setRawInput(sample.content));
    dispatch(setInputType(sample.type as any));
    setShowPasteModal(false);
    dispatch(analyzeComplaintText({ content: sample.content, sourceType: sample.type }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValues) return;
    const resultAction = await dispatch(submitComplaint(formValues));
    if (submitComplaint.fulfilled.match(resultAction)) {
      dispatch(fetchComplaints());
      dispatch(fetchAnalyticsSummary());
      onSavedSuccess();
    }
  };

  const handleChatSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;
    const q = chatQuery.trim();
    setChatHistory(prev => [...prev, { sender: 'user', text: q }]);
    setChatQuery('');

    setTimeout(() => {
      let reply = "I've reviewed the complaint details. ";
      const qLower = q.toLowerCase();
      if (qLower.includes('risk') || qLower.includes('rpn')) {
        reply += analysisResult ? `ICH Q9 Risk Level is ${analysisResult.risk_assessment.risk_level} (RPN: ${analysisResult.risk_assessment.rpn_score}). ${analysisResult.risk_assessment.reasoning}` : "Please upload or analyze a complaint to view the ICH Q9 Risk Matrix.";
      } else if (qLower.includes('duplicate')) {
        reply += analysisResult?.duplicate_info?.possible_duplicate ? `Potential duplicate identified (Confidence: ${Math.round((analysisResult.duplicate_info.confidence || 0.8) * 100)}%). Matching records: ${(analysisResult.duplicate_info.matching_complaint_ids || []).join(', ')}.` : "No duplicate complaints detected in the QMS database for this batch.";
      } else if (qLower.includes('capa') || qLower.includes('containment')) {
        reply += analysisResult ? `Recommended Containment: ${(analysisResult.capa_recommendations?.immediate_containment || []).join('; ')}.` : "Upload or paste complaint text to generate CAPA recommendations.";
      } else {
        reply += `Extracted Product: ${fv.product_name_raw || 'Awaiting extraction'}, Batch: ${fv.batch_number || 'N/A'}. All extraction parameters are pre-filled on the left panel for human QA verification.`;
      }
      setChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 400);
  };

  return (
    <div className="max-w-[1700px] mx-auto p-4 sm:p-5 space-y-4 font-sans text-slate-800">
      
      {/* Workflow Step Indicator */}
      <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xs border border-slate-800 flex items-center justify-between overflow-x-auto text-xs">
        <div className="flex items-center space-x-2 min-w-max">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
            !analysisResult && !isAnalyzing ? 'bg-sky-500 text-white ring-4 ring-sky-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>1</div>
          <span className={!analysisResult && !isAnalyzing ? 'font-bold text-sky-400' : 'text-slate-400'}>1. Document Intake</span>
        </div>
        
        <div className="h-[1px] w-6 bg-slate-800 hidden sm:block" />

        <div className="flex items-center space-x-2 min-w-max">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
            isAnalyzing ? 'bg-sky-500 text-white ring-4 ring-sky-500/20 animate-pulse' : (analysisResult ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700')
          }`}>2</div>
          <span className={isAnalyzing ? 'font-bold text-sky-400' : (analysisResult ? 'text-emerald-400 font-semibold' : 'text-slate-400')}>2. AI Analysis</span>
        </div>

        <div className="h-[1px] w-6 bg-slate-800 hidden sm:block" />

        <div className="flex items-center space-x-2 min-w-max">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
            analysisResult && !isSaving ? 'bg-sky-500 text-white ring-4 ring-sky-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>3</div>
          <span className={analysisResult && !isSaving ? 'font-bold text-sky-400' : 'text-slate-400'}>3. Human QA Review</span>
        </div>

        <div className="h-[1px] w-6 bg-slate-800 hidden sm:block" />

        <div className="flex items-center space-x-2 min-w-max">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
            isSaving ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 animate-spin' : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}>4</div>
          <span className={isSaving ? 'font-bold text-emerald-400' : 'text-slate-400'}>4. Logged to QMS</span>
        </div>
      </div>

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================= */}
        {/* LEFT PANEL: Log Customer Complaint Form (Width: 7 Cols)    */}
        {/* ========================================================= */}
        <form onSubmit={handleSave} className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
          
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Log Customer Complaint</h1>
              <p className="text-xs text-slate-500 mt-0.5">Pharmaceutical Quality Assurance Intake & Review Form</p>
            </div>
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300/80 shadow-2xs">
              Pending Triage
            </span>
          </div>

          {/* 1. ORIGIN & CUSTOMER DETAILS */}
          <div className="space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>1. ORIGIN & CUSTOMER DETAILS</span>
              {analysisResult && <span className="text-[10px] text-sky-600 font-semibold">• AI Extracted</span>}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Complaint Source */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Complaint Source</label>
                <input
                  type="text"
                  placeholder="Awaiting AI extraction..."
                  value={fv.complaint_source || fv.source_type || ''}
                  onChange={(e) => dispatch(updateFormValues({ complaint_source: e.target.value }))}
                  className={`w-full px-3 py-1.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                    analysisResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                  }`}
                />
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Customer Name</label>
                <input
                  type="text"
                  placeholder="Awaiting AI extraction..."
                  value={fv.customer_name || fv.reporter_organization || ''}
                  onChange={(e) => dispatch(updateFormValues({ customer_name: e.target.value, reporter_organization: e.target.value }))}
                  className={`w-full px-3 py-1.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                    analysisResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                  }`}
                />
              </div>

            </div>
          </div>

          {/* 2. PRODUCT & BATCH IDENTIFICATION */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>2. PRODUCT & BATCH IDENTIFICATION</span>
              {analysisResult && <span className="text-[10px] text-sky-600 font-semibold">• AI Extracted</span>}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Product Name</label>
                <input
                  type="text"
                  placeholder="Awaiting AI extraction..."
                  value={fv.product_name_raw || ''}
                  onChange={(e) => dispatch(updateFormValues({ product_name_raw: e.target.value }))}
                  className={`w-full px-3 py-1.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                    analysisResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                  }`}
                />
              </div>

              {/* Product Strength/Grade */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Product Strength/Grade</label>
                <input
                  type="text"
                  placeholder="Awaiting AI extraction..."
                  value={fv.product_strength || ''}
                  onChange={(e) => dispatch(updateFormValues({ product_strength: e.target.value }))}
                  className={`w-full px-3 py-1.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                    analysisResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                  }`}
                />
              </div>

              {/* Batch/Lot Number */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Batch/Lot Number</label>
                <input
                  type="text"
                  placeholder="Awaiting AI extraction..."
                  value={fv.batch_number || ''}
                  onChange={(e) => dispatch(updateFormValues({ batch_number: e.target.value }))}
                  className={`w-full px-3 py-1.5 text-xs font-mono font-bold border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                    analysisResult ? 'bg-sky-50/40 border-sky-300 text-sky-950' : 'bg-slate-50/70 border-slate-200'
                  }`}
                />
              </div>

              {/* Manufacturing Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Manufacturing Date</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Awaiting AI extraction..."
                    value={fv.manufacturing_date || ''}
                    onChange={(e) => dispatch(updateFormValues({ manufacturing_date: e.target.value }))}
                    className={`w-full px-3 py-1.5 pr-8 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                      analysisResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  />
                  <Calendar className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Expiry Date</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Awaiting AI extraction..."
                    value={fv.expiry_date || ''}
                    onChange={(e) => dispatch(updateFormValues({ expiry_date: e.target.value }))}
                    className={`w-full px-3 py-1.5 pr-8 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                      analysisResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  />
                  <Calendar className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Quantity Affected */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Quantity Affected</label>
                <div className="flex rounded-md overflow-hidden border border-slate-200 bg-slate-50/70">
                  <input
                    type="text"
                    placeholder="Awaiting AI extraction..."
                    value={fv.quantity_affected || ''}
                    onChange={(e) => dispatch(updateFormValues({ quantity_affected: e.target.value }))}
                    className="w-full px-3 py-1.5 text-xs font-medium bg-transparent focus:bg-white focus:outline-none placeholder-slate-400"
                  />
                  <span className="px-2.5 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold border-l border-slate-200 flex items-center">
                    units
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* 3. COMPLAINT DETAILS */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>3. COMPLAINT DETAILS</span>
              {analysisResult && <span className="text-[10px] text-sky-600 font-semibold">• AI Extracted</span>}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Complaint Type */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Complaint Type</label>
                <input
                  type="text"
                  placeholder="Awaiting AI extraction..."
                  value={fv.complaint_type || fv.defect_category || ''}
                  onChange={(e) => dispatch(updateFormValues({ complaint_type: e.target.value, defect_category: e.target.value }))}
                  className={`w-full px-3 py-1.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                    analysisResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                  }`}
                />
              </div>

              {/* Complaint Date */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Complaint Date</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Awaiting AI extraction..."
                    value={fv.complaint_date || ''}
                    onChange={(e) => dispatch(updateFormValues({ complaint_date: e.target.value }))}
                    className={`w-full px-3 py-1.5 pr-8 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 ${
                      analysisResult ? 'bg-sky-50/30 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                    }`}
                  />
                  <Calendar className="h-3.5 w-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

            </div>

            {/* Detailed Complaint Description */}
            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-slate-700">Detailed Complaint Description</label>
              <textarea
                rows={3}
                placeholder="Awaiting AI extraction..."
                value={fv.defect_description || ''}
                onChange={(e) => dispatch(updateFormValues({ defect_description: e.target.value }))}
                className={`w-full p-2.5 text-xs font-medium border rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none placeholder-slate-400 leading-relaxed resize-y ${
                  analysisResult ? 'bg-sky-50/20 border-sky-200' : 'bg-slate-50/70 border-slate-200'
                }`}
              />
            </div>
          </div>

          {/* 4. INITIAL ASSESSMENT & PRIORITY */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>4. INITIAL ASSESSMENT & PRIORITY</span>
              {analysisResult && <span className="text-[10px] text-sky-600 font-semibold">• ICH Q9 Evaluated</span>}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Initial Severity */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Initial Severity</label>
                <select
                  value={fv.severity || 'MINOR'}
                  onChange={(e) => dispatch(updateFormValues({ severity: e.target.value as SeverityType }))}
                  className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="MAJOR">MAJOR</option>
                  <option value="MINOR">MINOR</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Priority Level</label>
                <select
                  value={fv.priority || 'MEDIUM'}
                  onChange={(e) => dispatch(updateFormValues({ priority: e.target.value }))}
                  className="w-full px-3 py-1.5 text-xs font-bold bg-slate-50/70 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none"
                >
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => dispatch(resetIntake())}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition shadow-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Reset Form</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Persisting Record...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Complaint</span>
                </>
              )}
            </button>
          </div>

          {saveError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md font-medium">
              Error saving complaint: {saveError}
            </div>
          )}

        </form>

        {/* ========================================================= */}
        {/* RIGHT PANEL: QMS AI Copilot Panel (Width: 5 Cols)         */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4 sticky top-20">
          
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

          {/* DYNAMIC STATE 1: EMPTY (Before Upload) */}
          {!isAnalyzing && !analysisResult && (
            <div className="space-y-4">
              {/* Drag & Drop File Box */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                className="border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-xl p-5 text-center space-y-2 bg-slate-50/50 transition cursor-pointer"
              >
                <Upload className="h-7 w-7 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-700">
                  Drag & drop complaint document here
                </p>
                <p className="text-[11px] text-slate-500">
                  or <label htmlFor="file-input" className="text-sky-600 hover:underline font-bold cursor-pointer">browse file</label>
                </p>
                <input
                  type="file"
                  id="file-input"
                  accept=".pdf,.txt,.doc,.docx,.eml"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
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
                onClick={() => setShowPasteModal(true)}
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
                  {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleLoadSample(tmpl)}
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

          {/* DYNAMIC STATE 2: PROCESSING (During Extraction) */}
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

          {/* DYNAMIC STATE 3: COMPLETE (After Extraction & Analysis) */}
          {analysisResult && !isAnalyzing && (
            <div className="space-y-4">
              
              {/* Summary Stats Chips */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Completeness</span>
                  <span className="font-extrabold text-slate-900">{analysisResult.completeness.completeness_percentage}%</span>
                </div>
                <div className="h-5 w-[1px] bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Risk Level</span>
                  <span className="font-extrabold text-slate-900">{analysisResult.risk_assessment.risk_level}</span>
                </div>
                <div className="h-5 w-[1px] bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Duplicates</span>
                  <span className="font-extrabold text-slate-900">
                    {analysisResult.duplicate_info.possible_duplicate ? 'Match Found' : 'None'}
                  </span>
                </div>
              </div>

              {/* Result Cards */}
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                <CompletenessCard completeness={analysisResult.completeness} />
                <DuplicateAlert duplicateInfo={analysisResult.duplicate_info} />
                <RiskAssessmentCard risk={analysisResult.risk_assessment} />
                <CapaCard capa={analysisResult.capa_recommendations} />
              </div>

              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100 max-h-40 overflow-y-auto">
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg text-xs ${msg.sender === 'user' ? 'bg-slate-100 text-slate-900 ml-4 text-right' : 'bg-sky-50 border border-sky-100 text-slate-800 mr-4'}`}>
                      <span className="font-bold block text-[9px] text-slate-400 mb-0.5">{msg.sender === 'user' ? 'You' : 'AI Copilot'}</span>
                      {msg.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Chat Input Bar */}
              <form onSubmit={handleChatSend} className="space-y-1 pt-1 border-t border-slate-100">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Ask AI Copilot about this complaint..."
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    className="w-full pl-3 pr-10 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none placeholder-slate-400"
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

      </div>

      {/* Paste Complaint Text / Email Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-sky-600" /> Paste Raw Complaint Text / Email
              </h3>
              <button onClick={() => setShowPasteModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Sample Buttons */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 block">Select Quick Demo Sample Template:</span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadSample(tmpl)}
                    className="px-3 py-1 rounded bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-900 text-xs font-bold transition"
                  >
                    {tmpl.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              rows={8}
              placeholder="Paste raw complaint description, customer email text, or defect report here..."
              value={rawInput}
              onChange={(e) => dispatch(setRawInput(e.target.value))}
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-sky-500 focus:outline-none placeholder-slate-400"
            />

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-3.5 py-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTextSubmit}
                disabled={!rawInput.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-200" />
                <span>Analyze Text with LangGraph</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
