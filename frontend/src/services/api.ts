import axios from 'axios';
import {
  AnalysisPipelineResult,
  ComplaintSaveRequest,
  ComplaintResponse,
  Product,
  AnalyticsSummary
} from '../types';

const API_BASE = '/api/v1';

export const api = {
  // Analyze Raw Text / Email
  async analyzeText(content: string, sourceType: string = 'TEXT'): Promise<AnalysisPipelineResult> {
    const res = await axios.post(`${API_BASE}/complaints/analyze-text`, {
      content,
      source_type: sourceType,
    });
    return res.data;
  },

  // Analyze Uploaded File (PDF/Image)
  async analyzeFile(file: File): Promise<AnalysisPipelineResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/complaints/analyze-file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Save Finalized Complaint
  async logComplaint(data: ComplaintSaveRequest): Promise<ComplaintResponse> {
    const res = await axios.post(`${API_BASE}/complaints/log`, data);
    return res.data;
  },

  // Fetch Complaints List
  async getComplaints(params?: { status?: string; severity?: string; product_type?: string }): Promise<ComplaintResponse[]> {
    const res = await axios.get(`${API_BASE}/complaints`, { params });
    return res.data;
  },

  // Fetch Single Complaint Detail
  async getComplaintById(id: string): Promise<ComplaintResponse> {
    const res = await axios.get(`${API_BASE}/complaints/${id}`);
    return res.data;
  },

  // Fetch Seed Products
  async getProducts(): Promise<Product[]> {
    const res = await axios.get(`${API_BASE}/products`);
    return res.data;
  },

  // Fetch QMS Analytics Summary
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await axios.get(`${API_BASE}/analytics/summary`);
    return res.data;
  },

  // Send AI Copilot Chat Query (Real Groq LLM endpoint)
  async sendCopilotChat(query: string, complaintContext?: any, chatHistory?: any[]): Promise<{ reply: string; source: string }> {
    const res = await axios.post(`${API_BASE}/ai/copilot-chat`, {
      query,
      complaint_context: complaintContext,
      chat_history: chatHistory,
    });
    return res.data;
  }
};
