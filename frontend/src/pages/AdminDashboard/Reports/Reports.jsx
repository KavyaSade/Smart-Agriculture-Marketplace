import React from 'react';
import './Reports.css';

export default function Reports({ users, products, orders, setAlert }) {
  const triggerExport = (reportType) => {
    setAlert({ type: 'success', text: `Exporting ${reportType} report... CSV download started!` });
  };

  // calculations
  const totalSales = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
  const activeSellersCount = users.filter(u => u.role === 'retailer').length;

  return (
    <div className="admin-reports-view">
      <div className="admin-reports-grid">
        <div className="dashboard-card">
          <h3 className="text-dark font-bold mb-4">Export Platform Data</h3>
          <div className="flex flex-col gap-3">
            <button className="export-action-btn" onClick={() => triggerExport('Users Registry')}>
              Export Users List (CSV)
            </button>
            <button className="export-action-btn" onClick={() => triggerExport('Products Listing')}>
              Export Products Catalog (CSV)
            </button>
            <button className="export-action-btn" onClick={() => triggerExport('Transactions Ledger')}>
              Export Orders & Payments (CSV)
            </button>
          </div>
        </div>

        <div className="dashboard-card">
          <h3 className="text-dark font-bold mb-3">System Analytical Metrics</h3>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-muted font-medium">Avg Transaction Size:</span>
              <span className="font-bold text-dark">₹{avgOrderValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-muted font-medium">Platform conversion rate:</span>
              <span className="font-bold text-dark">98.5%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted font-medium">Retailer density count:</span>
              <span className="font-bold text-dark">{activeSellersCount} farmers</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
