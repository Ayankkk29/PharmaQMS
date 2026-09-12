import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { AnalysisPipelineResult, ComplaintSaveRequest, ComplaintResponse } from '../../types';

interface IntakeState {
  rawInput: string;
  inputType: 'TEXT' | 'EMAIL' | 'PDF_UPLOAD' | 'IMAGE_UPLOAD';
  selectedFile: File | null;
  isAnalyzing: boolean;
  analysisStep: string; // 'Parsing Input' | 'Extracting Details' | 'Checking Completeness' | 'Checking Duplicates' | 'Assessing ICH Q9 Risk' | 'Generating CAPA' | 'Done'
  analysisResult: AnalysisPipelineResult | null;
  formValues: ComplaintSaveRequest | null;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  error: string | null;
}

const initialState: IntakeState = {
  rawInput: '',
  inputType: 'TEXT',
  selectedFile: null,
  isAnalyzing: false,
  analysisStep: '',
  analysisResult: null,
  formValues: null,
  isSaving: false,
  saveSuccess: false,
  saveError: null,
  error: null,
};

export const analyzeComplaintText = createAsyncThunk(
  'intake/analyzeText',
  async ({ content, sourceType }: { content: string; sourceType: string }, { rejectWithValue }) => {
    try {
      const data = await api.analyzeText(content, sourceType);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to analyze text input');
    }
  }
);

export const analyzeComplaintFile = createAsyncThunk(
  'intake/analyzeFile',
  async (file: File, { rejectWithValue }) => {
    try {
      const data = await api.analyzeFile(file);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to analyze document file');
    }
  }
);

export const submitComplaint = createAsyncThunk(
  'intake/submitComplaint',
  async (data: ComplaintSaveRequest, { rejectWithValue }) => {
    try {
      const saved = await api.logComplaint(data);
      return saved;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to save complaint');
    }
  }
);

const intakeSlice = createSlice({
  name: 'intake',
  initialState,
  reducers: {
    setRawInput(state, action: PayloadAction<string>) {
      state.rawInput = action.payload;
    },
    setInputType(state, action: PayloadAction<'TEXT' | 'EMAIL' | 'PDF_UPLOAD' | 'IMAGE_UPLOAD'>) {
      state.inputType = action.payload;
    },
    setSelectedFile(state, action: PayloadAction<File | null>) {
      state.selectedFile = action.payload;
    },
    updateFormValues(state, action: PayloadAction<Partial<ComplaintSaveRequest>>) {
      if (state.formValues) {
        state.formValues = { ...state.formValues, ...action.payload };
      }
    },
    resetIntake(state) {
      state.rawInput = '';
      state.selectedFile = null;
      state.isAnalyzing = false;
      state.analysisStep = '';
      state.analysisResult = null;
      state.formValues = null;
      state.isSaving = false;
      state.saveSuccess = false;
      state.saveError = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Analyze Text
      .addCase(analyzeComplaintText.pending, (state) => {
        state.isAnalyzing = true;
        state.analysisStep = 'Analyzing text & executing LangGraph workflow...';
        state.error = null;
        state.analysisResult = null;
      })
      .addCase(analyzeComplaintText.fulfilled, (state, action: PayloadAction<AnalysisPipelineResult>) => {
        state.isAnalyzing = false;
        state.analysisStep = 'Analysis Complete';
        state.analysisResult = action.payload;
        
        const ext = action.payload.extracted_data;
        const comp = action.payload.completeness;
        const dup = action.payload.duplicate_info;
        
        state.formValues = {
          source_type: action.payload.source_type,
          raw_content: action.payload.raw_content,
          product_name_raw: ext.product_name || '',
          batch_number: ext.batch_number || '',
          reporter_name: ext.reporter_name || '',
          reporter_contact: ext.reporter_contact || '',
          reporter_organization: ext.reporter_organization || '',
          complaint_date: ext.complaint_date || new Date().toISOString().split('T')[0],
          event_date: ext.event_date || new Date().toISOString().split('T')[0],
          defect_category: ext.defect_category || 'Quality Defect',
          defect_description: ext.defect_description || action.payload.raw_content,
          severity: ext.severity || 'MINOR',
          status: 'LOGGED',
          is_complete: comp.is_complete,
          missing_fields: comp.missing_fields,
          is_potential_duplicate: dup.is_potential_duplicate,
          duplicate_of_number: dup.duplicate_of_number || undefined,
          duplicate_reason: dup.duplicate_reason || undefined,
          risk_assessment: action.payload.risk_assessment,
          capa_recommendations: action.payload.capa_recommendations
        };
      })
      .addCase(analyzeComplaintText.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.analysisStep = '';
        state.error = action.payload as string;
      })
      // Analyze File
      .addCase(analyzeComplaintFile.pending, (state) => {
        state.isAnalyzing = true;
        state.analysisStep = 'Parsing PDF/document content & running LangGraph pipeline...';
        state.error = null;
        state.analysisResult = null;
      })
      .addCase(analyzeComplaintFile.fulfilled, (state, action: PayloadAction<AnalysisPipelineResult>) => {
        state.isAnalyzing = false;
        state.analysisStep = 'Analysis Complete';
        state.analysisResult = action.payload;
        
        const ext = action.payload.extracted_data;
        const comp = action.payload.completeness;
        const dup = action.payload.duplicate_info;

        state.formValues = {
          source_type: action.payload.source_type,
          raw_content: action.payload.raw_content,
          product_name_raw: ext.product_name || '',
          batch_number: ext.batch_number || '',
          reporter_name: ext.reporter_name || '',
          reporter_contact: ext.reporter_contact || '',
          reporter_organization: ext.reporter_organization || '',
          complaint_date: ext.complaint_date || new Date().toISOString().split('T')[0],
          event_date: ext.event_date || new Date().toISOString().split('T')[0],
          defect_category: ext.defect_category || 'Quality Defect',
          defect_description: ext.defect_description || action.payload.raw_content,
          severity: ext.severity || 'MINOR',
          status: 'LOGGED',
          is_complete: comp.is_complete,
          missing_fields: comp.missing_fields,
          is_potential_duplicate: dup.is_potential_duplicate,
          duplicate_of_number: dup.duplicate_of_number || undefined,
          duplicate_reason: dup.duplicate_reason || undefined,
          risk_assessment: action.payload.risk_assessment,
          capa_recommendations: action.payload.capa_recommendations
        };
      })
      .addCase(analyzeComplaintFile.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.analysisStep = '';
        state.error = action.payload as string;
      })
      // Submit Complaint
      .addCase(submitComplaint.pending, (state) => {
        state.isSaving = true;
        state.saveError = null;
        state.saveSuccess = false;
      })
      .addCase(submitComplaint.fulfilled, (state) => {
        state.isSaving = false;
        state.saveSuccess = true;
      })
      .addCase(submitComplaint.rejected, (state, action) => {
        state.isSaving = false;
        state.saveError = action.payload as string;
      });
  }
});

export const {
  setRawInput,
  setInputType,
  setSelectedFile,
  updateFormValues,
  resetIntake
} = intakeSlice.actions;

export default intakeSlice.reducer;
