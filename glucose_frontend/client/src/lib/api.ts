import { apiRequest } from "./queryClient"; // Uses the template's built-in fetcher if available, or standard fetch

// If the template uses a specific fetch wrapper, we can use standard fetch for simplicity to ensure we hit YOUR backend
export const api = {
  // 1. AI Analysis
  analyze: async (patientId: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId })
    });
    return res.json();
  },

  // 2. Generate Report
  generateReport: async (year: number, month?: number) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month })
    });
    return res.json();
  }
};