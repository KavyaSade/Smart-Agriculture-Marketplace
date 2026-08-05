import React from 'react';
import './Sales.css';

export default function Sales({ orders, products, totalSalesCount, totalRevenue }) {
  // group sales totals by category
  const categoriesSales = products.reduce((acc, p) => {
    const totalAssocSales = orders
      .filter(o => o.productName === p.title && o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);
    acc[p.category] = (acc[p.category] || 0) + totalAssocSales;
    return acc;
  }, {});

  const categoryTotalsArray = Object.entries(categoriesSales);

  return (
    <div className="sales-view">
      <div className="sales-summary-grid">
        
        <div className="dashboard-card chart-container-card">
          <div className="card-header-row">
            <h3 className="text-dark">Product Sales by Category (₹)</h3>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded">Current Month</span>
          </div>
          
          {categoryTotalsArray.length > 0 ? (
            <>
              <div className="bar-chart-visual">
                {categoryTotalsArray.map(([cat, total]) => {
                  const maxCatVal = Math.max(...categoryTotalsArray.map(([_, v]) => v)) || 1;
                  const heightPct = Math.max(10, Math.min(100, (total / maxCatVal) * 100));

                  return (
                    <div key={cat} className="bar-column-wrapper">
                      <div 
                        className="bar-data-fill" 
                        style={{ height: `${heightPct}%` }}
                        data-value={`₹${total.toFixed(2)}`}
                      ></div>
                      <span className="bar-axis-label text-muted">{cat}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-xs text-muted mt-2">
                Hover over each bar to see exact total transaction amounts.
              </p>
            </>
          ) : (
            <div className="text-center py-12 text-muted">
              No sales records available to plot.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="dashboard-card">
            <h4 className="text-sm uppercase tracking-wider text-muted font-bold mb-3">Key Metrics</h4>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-muted font-medium">Successful Orders:</span>
                <span className="font-bold text-dark">{totalSalesCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-zinc-800">
                <span className="text-muted font-medium">Avg Order Value:</span>
                <span className="font-bold text-dark">
                  ₹{orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted font-medium">Cancellation Rate:</span>
                <span className="font-bold text-red-500">
                  {orders.length > 0 ? ((orders.filter(o => o.status === 'cancelled').length / orders.length) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-card bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30">
            <h4 className="text-sm font-bold text-dark dark:text-emerald-400 mb-2">Sustainable Farmer Bonus</h4>
            <p className="text-xs text-muted dark:text-emerald-300 leading-relaxed">
              Farmer Bonus: Your organic products get low store fees and better buyer views.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
