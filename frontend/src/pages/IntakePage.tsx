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
import { IntakeWorkflow } from '../components/intake/IntakeWorkflow';
import { ComplaintForm } from '../components/intake/ComplaintForm';
import { AICopilotPanel } from '../components/intake/AICopilotPanel';
import { FileText, X, Sparkles } from 'lucide-react';

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
        reply += `Extracted Product: ${formValues?.product_name_raw || 'Awaiting extraction'}, Batch: ${formValues?.batch_number || 'N/A'}. All extraction parameters are pre-filled on the left panel for human QA verification.`;
      }
      setChatHistory(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 400);
  };

  return (
    <div className="max-w-[1700px] mx-auto p-4 sm:p-5 space-y-4 font-sans text-slate-800">
      
      {/* Workflow Step Indicator */}
      <IntakeWorkflow
        isAnalyzing={isAnalyzing}
        hasResult={!!analysisResult}
        isSaving={isSaving}
      />

      {/* 2-Column Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT PANEL: Log Customer Complaint Form */}
        <ComplaintForm
          formValues={formValues || {}}
          hasResult={!!analysisResult}
          isSaving={isSaving}
          saveError={saveError}
          onUpdateForm={(fieldValues) => dispatch(updateFormValues(fieldValues))}
          onReset={() => dispatch(resetIntake())}
          onSave={handleSave}
        />

        {/* RIGHT PANEL: QMS AI Copilot Panel */}
        <AICopilotPanel
          isAnalyzing={isAnalyzing}
          analysisResult={analysisResult}
          selectedFile={selectedFile}
          rawInput={rawInput}
          chatQuery={chatQuery}
          chatHistory={chatHistory}
          sampleTemplates={SAMPLE_TEMPLATES}
          onFileUpload={handleFileUpload}
          onFileDrop={handleFileDrop}
          onOpenPasteModal={() => setShowPasteModal(true)}
          onLoadSample={handleLoadSample}
          onChatQueryChange={setChatQuery}
          onChatSend={handleChatSend}
        />

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
