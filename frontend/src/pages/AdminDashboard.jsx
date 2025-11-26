import { useState } from 'react';

export default function AdminDashboard() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Call YOUR Local Node Backend
      const res = await fetch('http://localhost:5000/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year: 2024 }) // Defaults to yearly report for 2024
      });
      const data = await res.json();
      if (data.success) setReport(data.report);
    } catch (err) {
      alert("Backend not running! Make sure you started 'node server.js'");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Administrator Panel</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Clinical Reports</h2>
        <p className="text-gray-600 mb-4">Generate system-wide analysis for active patients and abnormalities.</p>
        <button 
          onClick={generateReport}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Yearly Report"}
        </button>
      </div>

      {report && (
        <div className="bg-white p-6 rounded-lg shadow animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold border-b pb-2 mb-4">Report Results ({report.period})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-2xl font-bold text-blue-700">{report.total_active_patients}</div>
              <div className="text-sm text-gray-600">Active Patients</div>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <div className="text-2xl font-bold text-green-700">{report.avg_sugar_level}</div>
              <div className="text-sm text-gray-600">Avg Glucose Level</div>
            </div>
            <div className="bg-red-50 p-4 rounded">
              <div className="text-2xl font-bold text-red-700">{report.abnormal_count}</div>
              <div className="text-sm text-gray-600">Abnormal Readings</div>
            </div>
             <div className="bg-yellow-50 p-4 rounded">
              <div className="text-2xl font-bold text-yellow-700">{report.highest_reading}</div>
              <div className="text-sm text-gray-600">Highest Recorded</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}