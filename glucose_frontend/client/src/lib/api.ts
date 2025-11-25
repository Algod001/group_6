// glucose_frontend/client/src/lib/api.ts

export const api = {
  // 1. AI Analysis (Patient)
  analyze: async (patientId: string) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId })
    });
    return res.json();
  },

  // 2. Generate Report (Admin)
  generateReport: async (year: number, month?: number) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ year, month })
    });
    return res.json();
  },

  // 3. Create User (Admin) - NEW ADDITION
  createUser: async (userData: any) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  }
};