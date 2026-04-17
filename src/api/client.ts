import { createEdgeSpark } from '@edgespark/client';
import '@edgespark/client/styles.css';
import type { Assessment, Consultation, UserProfile } from '../types/assessment';

// Backend URL - deployed worker
const WORKER_URL = 'https://staging--70ejqxdidlub37lz4qij.youbase.cloud';

// Create the EdgeSpark client
export const client = createEdgeSpark({ baseUrl: WORKER_URL });

// API helper functions
export const api = {
  // Profile
  async getProfile(): Promise<{ profile: UserProfile }> {
    const res = await client.api.fetch('/api/profile');
    if (!res.ok) throw new Error('Failed to get profile');
    return res.json();
  },

  async updateProfile(data: Partial<UserProfile>): Promise<{ profile: UserProfile }> {
    const res = await client.api.fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Assessments
  async createAssessment(
    assessmentType: 'snapshot' | 'comprehensive',
    responses: Record<string, any>
  ): Promise<{ assessment: Assessment }> {
    const res = await client.api.fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessmentType, responses }),
    });
    if (!res.ok) throw new Error('Failed to create assessment');
    return res.json();
  },

  async getAssessments(): Promise<{ assessments: Assessment[] }> {
    const res = await client.api.fetch('/api/assessments');
    if (!res.ok) {
      console.error('[API] getAssessments failed:', res.status);
      return { assessments: [] };
    }
    return res.json();
  },

  async getAssessment(id: number): Promise<{ assessment: Assessment }> {
    const res = await client.api.fetch(`/api/assessments/${id}`);
    if (!res.ok) throw new Error('Failed to get assessment');
    return res.json();
  },

  async getLatestAssessment(): Promise<{ assessment: Assessment | null }> {
    const res = await client.api.fetch('/api/assessments/latest');
    if (!res.ok) {
      // If 404 or no assessment found, return null instead of throwing
      if (res.status === 404) {
        return { assessment: null };
      }
      console.error('[API] getLatestAssessment failed:', res.status, await res.text());
      return { assessment: null };
    }
    return res.json();
  },

  async getScoreHistory(): Promise<{ history: any[] }> {
    const res = await client.api.fetch('/api/analytics/history');
    if (!res.ok) throw new Error('Failed to get score history');
    return res.json();
  },

  // Consultations
  async createConsultation(
    scheduledAt: number,
    notes?: string
  ): Promise<{ consultation: Consultation }> {
    const res = await client.api.fetch('/api/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt, notes }),
    });
    if (!res.ok) throw new Error('Failed to create consultation');
    return res.json();
  },

  async getConsultations(): Promise<{ consultations: Consultation[] }> {
    const res = await client.api.fetch('/api/consultations');
    if (!res.ok) throw new Error('Failed to get consultations');
    return res.json();
  },

  async cancelConsultation(id: number): Promise<{ consultation: Consultation }> {
    const res = await client.api.fetch(`/api/consultations/${id}/cancel`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to cancel consultation');
    return res.json();
  },
};
