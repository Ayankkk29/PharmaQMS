import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../services/api';
import { ComplaintResponse, AnalyticsSummary, NavTab } from '../../types';

interface ComplaintsState {
  items: ComplaintResponse[];
  selectedComplaint: ComplaintResponse | null;
  analytics: AnalyticsSummary | null;
  isLoading: boolean;
  error: string | null;
  activeNavTab: NavTab;
  filters: {
    status: string;
    severity: string;
    productType: string;
    searchQuery: string;
  };
}

const initialState: ComplaintsState = {
  items: [],
  selectedComplaint: null,
  analytics: null,
  isLoading: false,
  error: null,
  activeNavTab: 'log',
  filters: {
    status: '',
    severity: '',
    productType: '',
    searchQuery: '',
  },
};

export const fetchComplaints = createAsyncThunk(
  'complaints/fetchComplaints',
  async (params: { status?: string; severity?: string; product_type?: string } | undefined, { rejectWithValue }) => {
    try {
      const data = await api.getComplaints(params);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch complaints');
    }
  }
);

export const fetchComplaintById = createAsyncThunk(
  'complaints/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await api.getComplaintById(id);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch complaint detail');
    }
  }
);

export const fetchAnalyticsSummary = createAsyncThunk(
  'complaints/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const data = await api.getAnalyticsSummary();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch analytics');
    }
  }
);

const complaintsSlice = createSlice({
  name: 'complaints',
  initialState,
  reducers: {
    setActiveNavTab(state, action: PayloadAction<NavTab>) {
      state.activeNavTab = action.payload;
    },
    setFilterStatus(state, action: PayloadAction<string>) {
      state.filters.status = action.payload;
    },
    setFilterSeverity(state, action: PayloadAction<string>) {
      state.filters.severity = action.payload;
    },
    setFilterProductType(state, action: PayloadAction<string>) {
      state.filters.productType = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.filters.searchQuery = action.payload;
    },
    setSelectedComplaint(state, action: PayloadAction<ComplaintResponse | null>) {
      state.selectedComplaint = action.payload;
    },
    clearFilters(state) {
      state.filters = {
        status: '',
        severity: '',
        productType: '',
        searchQuery: '',
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Complaints
      .addCase(fetchComplaints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchComplaints.fulfilled, (state, action: PayloadAction<ComplaintResponse[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchComplaints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch By Id
      .addCase(fetchComplaintById.fulfilled, (state, action: PayloadAction<ComplaintResponse>) => {
        state.selectedComplaint = action.payload;
      })
      // Fetch Analytics
      .addCase(fetchAnalyticsSummary.fulfilled, (state, action: PayloadAction<AnalyticsSummary>) => {
        state.analytics = action.payload;
      });
  }
});

export const {
  setActiveNavTab,
  setFilterStatus,
  setFilterSeverity,
  setFilterProductType,
  setSearchQuery,
  setSelectedComplaint,
  clearFilters
} = complaintsSlice.actions;

export default complaintsSlice.reducer;
