import React, { useState, useMemo } from 'react';
import './Reports.css';

export default function Reports({ orders = [], products = [] }) {
  const [activeSubTab, setActiveSubTab] = useState('spending');
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  // Helper to filter orders by time range
  const filterByTime = (orderDateStr, filter) => {
    if (filter === 'all') return true;
    try {
      const orderDate = new Date(orderDateStr);
      if (isNaN(orderDate.getTime())) return true;
      const now = new Date();
      const diffTime = Math.abs(now - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (filter === 'today') return diffDays <= 1;
      if (filter === 'week') return diffDays <= 7;
      if (filter === 'month') return diffDays <= 30;
      if (filter === 'quarter') return diffDays <= 90;
    } catch (e) {
      return true;
    }
    return true;
  };

  // Helper: map order's product name or ID to categories
  const getProductCategory = (order) => {
   
    const prod = products.find(p => p._id === order.productId || p.id === order.productId || p.title === order.productName);
    return prod && prod.category ? prod.category.toLowerCase().trim() : 'grains';
  };

  // Filtered orders list for the buyer
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // 1. Time Range
      const matchesTime = filterByTime(order.date, timeFilter);
      // 2. Order Status
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      // 3. Search query (Product Name or Order ID)
      const matchesSearch = searchQuery === '' || 
        order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTime && matchesStatus && matchesSearch;
    });
  }, [orders, timeFilter, statusFilter, searchQuery]);

  // Spending Report Metrics
  const spendingMetrics = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalSpent = validOrders.reduce((sum, o) => sum + Number(o.amount || o.finalAmount || 0), 0);
    const totalOrders = validOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Spending by Category
    const categorySpend = {};
    validOrders.forEach(o => {
      const cat = getProductCategory(o);
      categorySpend[cat] = (categorySpend[cat] || 0) + Number(o.amount || o.finalAmount || 0);
    });

    // Monthly Spending (extract months from dates)
    const monthlySpend = {};
    validOrders.forEach(o => {
      let monthName = 'Unknown';
      try {
        const d = new Date(o.date);
        if (!isNaN(d.getTime())) {
          monthName = d.toLocaleString('en-US', { month: 'short' });
        } else {
          // fallback parser for format like "Aug 21, 2026"
          const parts = o.date.split(' ');
          if (parts.length > 0) monthName = parts[0];
        }
      } catch (err) {
        // use fallback
      }
      monthlySpend[monthName] = (monthlySpend[monthName] || 0) + Number(o.amount || o.finalAmount || 0);
    });

    return { totalSpent, totalOrders, avgOrderValue, categorySpend, monthlySpend };
  }, [orders, products]);

  // Savings Report Metrics
  const savingsMetrics = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const totalSavings = validOrders.reduce((sum, o) => sum + Number(o.discountAmount || 0), 0);
    const couponOrders = validOrders.filter(o => o.couponCode);
    const totalSpending = validOrders.reduce((sum, o) => sum + Number(o.amount || o.finalAmount || 0), 0);
    const savingsRate = (totalSpending + totalSavings) > 0 ? (totalSavings / (totalSpending + totalSavings)) * 100 : 0;

    // Coupons Breakdown
    const couponSavings = {};
    couponOrders.forEach(o => {
      couponSavings[o.couponCode] = (couponSavings[o.couponCode] || 0) + Number(o.discountAmount || 0);
    });

    return { totalSavings, couponUsageCount: couponOrders.length, savingsRate, couponSavings };
  }, [orders]);

  // Export to PDF Handler
  const handleDownloadPDF = () => {
    setExporting(true);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '0px';
    iframe.style.width = '800px';
    iframe.style.height = '1200px';
    iframe.style.border = 'none';

    const handleMessage = (event) => {
      if (event.data === 'pdf-download-finished') {
        document.body.removeChild(iframe);
        window.removeEventListener('message', handleMessage);
        setExporting(false);
      }
    };
    window.addEventListener('message', handleMessage);
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();

    let reportTitle = "";
    let contentHtml = "";

    if (activeSubTab === 'spending') {
      reportTitle = "Buyer Spending Analytics";
      const monthlyArray = Object.entries(spendingMetrics.monthlySpend);
      const categoryArray = Object.entries(spendingMetrics.categorySpend);

      contentHtml = `
        <div class="stats-strip">
          <div class="stat-box">
            <div class="stat-box-label">Total Spending</div>
            <div class="stat-box-val">₹${spendingMetrics.totalSpent.toFixed(2)}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Delivered Orders</div>
            <div class="stat-box-val">${spendingMetrics.totalOrders}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Avg Order Value</div>
            <div class="stat-box-val">₹${spendingMetrics.avgOrderValue.toFixed(2)}</div>
          </div>
        </div>

        <h3>Monthly Spending Breakdown</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <thead>
            <tr>
              <th>Month</th>
              <th style="text-align: right;">Spent Amount</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyArray.map(([m, val]) => `
              <tr>
                <td><strong>${m}</strong></td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">₹${val.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3>Category Expenditures</h3>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Product Category</th>
              <th style="text-align: right;">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${categoryArray.map(([cat, val]) => `
              <tr>
                <td style="text-transform: capitalize;"><strong>${cat}</strong></td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">₹${val.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeSubTab === 'history') {
      reportTitle = "Buyer Purchase Ledger";
      contentHtml = `
        <div class="stats-strip">
          <div class="stat-box">
            <div class="stat-box-label">Filtered Orders</div>
            <div class="stat-box-val">${filteredOrders.length}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Active Time Range</div>
            <div class="stat-box-val" style="text-transform: uppercase;">${timeFilter}</div>
          </div>
        </div>

        <h3>Order History List</h3>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Product Name</th>
              <th>Qty</th>
              <th style="text-align: right;">Paid Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.date}</td>
                <td>${o.productName}</td>
                <td>${o.quantity} ${o.unit || 'Kg'}</td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">₹${(o.amount || o.finalAmount || 0).toFixed(2)}</td>
                <td style="text-transform: uppercase; font-size: 10px; font-weight: 700; color: ${o.status === 'cancelled' ? '#ef4444' : '#10b981'};">
                  ${o.status}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeSubTab === 'savings') {
      reportTitle = "Buyer Coupon & Savings Statement";
      const couponArray = Object.entries(savingsMetrics.couponSavings);

      contentHtml = `
        <div class="stats-strip">
          <div class="stat-box">
            <div class="stat-box-label">Total Coupon Savings</div>
            <div class="stat-box-val">₹${savingsMetrics.totalSavings.toFixed(2)}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Coupon Orders</div>
            <div class="stat-box-val">${savingsMetrics.couponUsageCount}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Savings Rate</div>
            <div class="stat-box-val">${savingsMetrics.savingsRate.toFixed(1)}%</div>
          </div>
        </div>

        <h3>Savings per Coupon Code</h3>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Coupon Code</th>
              <th style="text-align: right;">Discount Earned</th>
            </tr>
          </thead>
          <tbody>
            ${couponArray.length > 0 ? couponArray.map(([code, val]) => `
              <tr>
                <td><strong style="color: #40916c;">${code}</strong></td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">₹${val.toFixed(2)}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="2" style="text-align: center; color: #64748b;">No coupon discount records found.</td>
              </tr>
            `}
          </tbody>
        </table>
      `;
    }

    const filename = `buyer_report_${activeSubTab}_${Date.now()}.pdf`;

    const htmlString = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              color: #1e293b; 
              background-color: #ffffff;
            }
            .report-card { 
              max-width: 720px; 
              margin: 0 auto; 
              border: 1px solid #e2e8f0; 
              border-radius: 12px; 
              padding: 30px; 
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); 
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              border-bottom: 2px solid #40916c; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .logo { 
              font-size: 26px; 
              font-weight: 800; 
              color: #1b4332; 
            }
            .logo span { 
              color: #52b788; 
            }
            .title { 
              font-size: 13px; 
              color: #64748b; 
              text-align: right; 
              line-height: 1.5; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; 
              font-size: 12px; 
            }
            th, td { 
              padding: 10px 12px; 
              border-bottom: 1px solid #f1f5f9; 
              text-align: left; 
            }
            th { 
              background-color: #f4faf6; 
              color: #1b4332; 
              font-weight: 700; 
              text-transform: uppercase;
              font-size: 10px;
            }
            .stats-strip {
              background-color: #eaf7ee;
              border: 1px solid rgba(64, 145, 108, 0.2);
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
            }
            .stat-box {
              flex: 1;
              text-align: center;
            }
            .stat-box-label {
              font-size: 10px;
              font-weight: bold;
              color: #1b4332;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .stat-box-val {
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
            }
            .stat-divider {
              border-left: 1px solid rgba(64, 145, 108, 0.2);
              height: 35px;
              align-self: center;
            }
            .footer { 
              text-align: center; 
              margin-top: 50px; 
              font-size: 11px; 
              color: #94a3b8; 
              border-top: 1px solid #e2e8f0; 
              padding-top: 20px; 
            }
          </style>
        </head>
        <body>
          <div class="report-card" id="pdf-report-content">
            <div class="header">
              <div>
                <div class="logo">Agri<span>Market</span></div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Direct Farm-to-Consumer Marketplace</div>
              </div>
              <div class="title">
                <strong style="font-size: 18px; color: #0f172a; text-transform: uppercase;">${reportTitle}</strong><br>
                Report ID: <strong>AM-BYR-${Date.now().toString().substring(6)}</strong><br>
                Date Issued: <strong>${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</strong><br>
                Classification: <strong>Buyer Personal Ledger</strong>
              </div>
            </div>

            ${contentHtml}

            <div class="footer">
              AgriMarket Buyer Analytics Statement.<br>
              This is an authenticated system generated document compiled from secure user orders.
            </div>
          </div>
        </body>
      </html>
    `;

    doc.write(htmlString);

    const iframeScript = doc.createElement('script');
    iframeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    iframeScript.onload = () => {
      const runInner = doc.createElement('script');
      runInner.innerHTML = `
        const element = document.getElementById('pdf-report-content');
        const opt = {
          margin:       15,
          filename:     '${filename}',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, scrollY: 0, scrollX: 0, windowWidth: 800 },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        setTimeout(() => {
          window.html2pdf().set(opt).from(element).save().then(() => {
            window.parent.postMessage('pdf-download-finished', '*');
          }).catch(err => {
            console.error("PDF generation inner error: ", err);
            window.parent.postMessage('pdf-download-finished', '*');
          });
        }, 400);
      `;
      doc.body.appendChild(runInner);
    };
    doc.head.appendChild(iframeScript);
    doc.close();
  };

  return (
    <div className="reports-view-wrapper">
      {/* Sub-tabs Navigation */}
      <div className="reports-tabs-bar">
        <button 
          onClick={() => setActiveSubTab('spending')}
          className={`reports-sub-tab-btn ${activeSubTab === 'spending' ? 'active' : ''}`}
        >
          Spending Report
        </button>
        <button 
          onClick={() => setActiveSubTab('history')}
          className={`reports-sub-tab-btn ${activeSubTab === 'history' ? 'active' : ''}`}
        >
          Purchase History
        </button>
        <button 
          onClick={() => setActiveSubTab('savings')}
          className={`reports-sub-tab-btn ${activeSubTab === 'savings' ? 'active' : ''}`}
        >
          Savings Report
        </button>

        <button 
          className="reports-pdf-export-btn"
          onClick={handleDownloadPDF}
          disabled={exporting}
        >
          {exporting ? 'Compiling...' : 'Export PDF Report'}
        </button>
      </div>

      {/* RENDER ACTIVE REPORT SUBTAB */}
      <div className="report-content-body">
        
        {activeSubTab === 'spending' && (
          <div className="report-panel-fade animate-fade-in">
            {/* KPI Metrics */}
            <div className="reports-kpi-grid">
              <div className="kpi-card">
                <span className="kpi-title">Total Spending</span>
                <span className="kpi-value text-emerald-600">₹{spendingMetrics.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="kpi-subtitle">Excluding cancelled orders</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Total Orders</span>
                <span className="kpi-value text-slate-800 dark:text-slate-100">{spendingMetrics.totalOrders}</span>
                <span className="kpi-subtitle">Completed/Pending deliveries</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Average Order Value</span>
                <span className="kpi-value text-blue-600">₹{spendingMetrics.avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="kpi-subtitle">Average value per transaction</span>
              </div>
            </div>

            {/* Visual Charts */}
            <div className="reports-charts-container-row">
              {/* Monthly Spending Trend Bar Chart */}
              <div className="report-chart-box">
                <h3 className="chart-title text-dark">Monthly Spending Trend</h3>
                {Object.keys(spendingMetrics.monthlySpend).length > 0 ? (
                  <div className="custom-bar-chart-widget">
                    {Object.entries(spendingMetrics.monthlySpend).map(([month, val]) => {
                      const maxVal = Math.max(...Object.values(spendingMetrics.monthlySpend)) || 1;
                      const heightPct = (val / maxVal) * 100;
                      return (
                        <div key={month} className="chart-bar-column">
                          <div className="chart-bar-fill-wrapper">
                            <div 
                              className="chart-bar-fill bg-emerald-500" 
                              style={{ height: `${heightPct}%` }}
                              title={`Spent: ₹${val.toFixed(2)}`}
                            >
                              <span className="chart-tooltip-text">₹{val.toFixed(0)}</span>
                            </div>
                          </div>
                          <span className="chart-bar-label">{month}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-chart-note text-muted">No spending history to plot.</div>
                )}
              </div>

              {/* Category-wise Spending Progress */}
              <div className="report-chart-box">
                <h3 className="chart-title text-dark">Spending by Crop Category</h3>
                {Object.keys(spendingMetrics.categorySpend).length > 0 ? (
                  <div className="category-spend-progress-list">
                    {Object.entries(spendingMetrics.categorySpend).map(([cat, val]) => {
                      const pctOfTotal = spendingMetrics.totalSpent > 0 ? (val / spendingMetrics.totalSpent) * 100 : 0;
                      return (
                        <div key={cat} className="category-progress-row">
                          <div className="category-info-meta">
                            <span className="category-name capitalize">{cat}</span>
                            <span className="category-value-details">₹{val.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({pctOfTotal.toFixed(0)}%)</span>
                          </div>
                          <div className="category-progress-track">
                            <div className="category-progress-bar bg-emerald-600" style={{ width: `${pctOfTotal}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-chart-note text-muted">No category information found.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'history' && (
          <div className="report-panel-fade animate-fade-in">
            {/* Filtering Actions */}
            <div className="reports-filter-strip">
              <div className="filter-group">
                <label className="text-muted">Time Period:</label>
                <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="reports-dropdown-input">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 90 Days</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="text-muted">Status:</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="reports-dropdown-input">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="shipped">Shipped</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="search-group">
                <input 
                  type="text" 
                  placeholder="Search by order ID or crop..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="reports-search-text"
                />
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="desktop-table-layout scroll-wrapper">
              <table className="reports-data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Product details</th>
                    <th>Quantity</th>
                    <th>Total Price</th>
                    <th>Delivery Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(o => (
                      <tr key={o.id}>
                        <td><strong>{o.id}</strong></td>
                        <td>{o.date}</td>
                        <td>{o.productName}</td>
                        <td>{o.quantity} {o.unit || 'Kg'}</td>
                        <td className="font-bold text-slate-800 dark:text-slate-100">₹{(o.amount || o.finalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td>
                          <span className={`status-badge-pill ${o.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-muted">No orders match the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid View */}
            <div className="mobile-cards-layout">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(o => (
                  <div key={o.id} className="mobile-order-card">
                    <div className="card-top-row">
                      <span className="card-order-id font-bold">{o.id}</span>
                      <span className={`status-badge-pill ${o.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="card-details-list">
                      <div className="card-detail-item">
                        <span className="detail-lbl text-muted">Date:</span>
                        <span className="detail-val">{o.date}</span>
                      </div>
                      <div className="card-detail-item">
                        <span className="detail-lbl text-muted">Product:</span>
                        <span className="detail-val font-medium">{o.productName}</span>
                      </div>
                      <div className="card-detail-item">
                        <span className="detail-lbl text-muted">Quantity:</span>
                        <span className="detail-val">{o.quantity} {o.unit || 'Kg'}</span>
                      </div>
                      <div className="card-detail-item border-t border-slate-100 dark:border-zinc-800 pt-2 mt-2">
                        <span className="detail-lbl text-muted font-bold">Total Paid:</span>
                        <span className="detail-val font-bold text-emerald-600">₹{(o.amount || o.finalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-cards-note text-center py-8 text-muted">No orders match the filters.</div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'savings' && (
          <div className="report-panel-fade animate-fade-in">
            {/* KPI Metrics */}
            <div className="reports-kpi-grid">
              <div className="kpi-card">
                <span className="kpi-title">Total Coupon Savings</span>
                <span className="kpi-value text-emerald-600">₹{savingsMetrics.totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="kpi-subtitle">Saved via coupon discounts</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Coupon Usage Count</span>
                <span className="kpi-value text-slate-800 dark:text-slate-100">{savingsMetrics.couponUsageCount}</span>
                <span className="kpi-subtitle">Orders with applied code</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Average Savings Rate</span>
                <span className="kpi-value text-blue-600">{savingsMetrics.savingsRate.toFixed(1)}%</span>
                <span className="kpi-subtitle">Percentage off total spent</span>
              </div>
            </div>

            {/* Savings Details Section */}
            <div className="reports-charts-container-row">
              
              {/* Savings Comparison Strip */}
              <div className="report-chart-box">
                <h3 className="chart-title text-dark">Savings Ratio</h3>
                <div className="savings-ratio-visualizer">
                  <div className="ratio-progress-container">
                    <div className="ratio-segment paid" style={{ width: `${100 - savingsMetrics.savingsRate}%` }}>
                      <span className="segment-label">Paid: {(100 - savingsMetrics.savingsRate).toFixed(1)}%</span>
                    </div>
                    <div className="ratio-segment saved" style={{ width: `${savingsMetrics.savingsRate}%` }}>
                      <span className="segment-label">Saved: {savingsMetrics.savingsRate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="legend-row">
                    <div className="legend-item"><span className="legend-dot paid-dot"></span> Total Paid: ₹{spendingMetrics.totalSpent.toLocaleString()}</div>
                    <div className="legend-item"><span className="legend-dot saved-dot"></span> Total Saved: ₹{savingsMetrics.totalSavings.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Coupons Table */}
              <div className="report-chart-box">
                <h3 className="chart-title text-dark">Savings by Coupon Code</h3>
                <div className="scroll-wrapper">
                  <table className="reports-data-table font-sans">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th style={{ textAlign: 'right' }}>Total Saved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(savingsMetrics.couponSavings).length > 0 ? (
                        Object.entries(savingsMetrics.couponSavings).map(([code, val]) => (
                          <tr key={code}>
                            <td><strong className="text-emerald-700 dark:text-emerald-400">{code}</strong></td>
                            <td style={{ textAlign: 'right' }} className="font-bold text-slate-800 dark:text-slate-100">₹{val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="text-center py-4 text-muted">No coupon codes used yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
