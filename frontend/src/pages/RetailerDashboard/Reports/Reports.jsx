import React, { useState, useMemo } from 'react';
import './Reports.css';

export default function Reports({ orders = [], products = [] }) {
  const [activeSubTab, setActiveSubTab] = useState('sales');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cogsPercent, setCogsPercent] = useState(60); // default 60% Cost of Goods Sold
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

  // Filtered orders for the retailer
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesTime = filterByTime(o.date, timeFilter);
      const matchesSearch = searchQuery === '' || 
        o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTime && matchesSearch;
    });
  }, [orders, timeFilter, searchQuery]);

  // Sales & Revenue metrics
  const salesMetrics = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const grossSales = validOrders.reduce((sum, o) => sum + Number(o.amount || o.finalAmount || 0), 0);
    const successfulSales = validOrders.length;
    const avgOrderValue = successfulSales > 0 ? grossSales / successfulSales : 0;

    // Revenue by Month
    const monthlySales = {};
    validOrders.forEach(o => {
      let monthName = 'Unknown';
      try {
        const d = new Date(o.date);
        if (!isNaN(d.getTime())) {
          monthName = d.toLocaleString('en-US', { month: 'short' });
        } else {
          const parts = o.date.split(' ');
          if (parts.length > 0) monthName = parts[0];
        }
      } catch (err) {
        // fallback
      }
      monthlySales[monthName] = (monthlySales[monthName] || 0) + Number(o.amount || o.finalAmount || 0);
    });

    // Revenue by Category
    const categorySales = {};
    validOrders.forEach(o => {
      // look up product to find category
      const prod = products.find(p => p.title === o.productName || p.name === o.productName || p._id === o.productId);
      const cat = prod && prod.category ? prod.category.toLowerCase().trim() : 'grains';
      categorySales[cat] = (categorySales[cat] || 0) + Number(o.amount || o.finalAmount || 0);
    });

    return { grossSales, successfulSales, avgOrderValue, monthlySales, categorySales };
  }, [orders, products]);

  // Product & Inventory performance metrics
  const productPerformance = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    
    // Map product data
    const list = products.map(prod => {
      const pId = prod._id || prod.id;
      
      // Calculate units sold
      const unitsSold = validOrders
        .filter(o => o.productName === prod.title || o.productName === prod.name || o.productId === pId)
        .reduce((sum, o) => sum + Number(o.quantity || 0), 0);

      // Calculate total revenue generated
      const revenue = validOrders
        .filter(o => o.productName === prod.title || o.productName === prod.name || o.productId === pId)
        .reduce((sum, o) => sum + Number(o.amount || o.finalAmount || 0), 0);

      // Turnover rate = sold / (sold + stock) * 100%
      const totalUnits = unitsSold + prod.stock;
      const turnoverRate = totalUnits > 0 ? (unitsSold / totalUnits) * 100 : 0;

      return {
        id: pId,
        title: prod.title || prod.name,
        category: prod.category,
        price: prod.price,
        stock: prod.stock,
        stockUnit: prod.stockUnit || 'Kg',
        unitsSold,
        revenue,
        turnoverRate
      };
    });

    // Overview KPIs
    const activeListings = products.length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
    const restockAlerts = products.filter(p => p.stock <= 10).length;

    return { list, activeListings, outOfStock, lowStock, restockAlerts };
  }, [products, orders]);

  // Profitability calculations based on slider
  const profitabilityMetrics = useMemo(() => {
    const grossSales = salesMetrics.grossSales;
    const platformFee = grossSales * 0.05; // 5% platform commission
    const costOfGoods = grossSales * (cogsPercent / 100);
    const netProfit = grossSales - platformFee - costOfGoods;
    const profitMargin = grossSales > 0 ? (netProfit / grossSales) * 100 : 0;

    // Profitability per product (using productPerformance list)
    const productProfits = productPerformance.list.map(p => {
      const pPlatformFee = p.revenue * 0.05;
      const pCogs = p.revenue * (cogsPercent / 100);
      const pNetProfit = p.revenue - pPlatformFee - pCogs;
      const pMargin = p.revenue > 0 ? (pNetProfit / p.revenue) * 100 : 0;

      return {
        ...p,
        platformFee: pPlatformFee,
        cogs: pCogs,
        netProfit: pNetProfit,
        profitMargin: pMargin
      };
    }).sort((a, b) => b.netProfit - a.netProfit); // sort by highest profit

    return { grossSales, platformFee, costOfGoods, netProfit, profitMargin, productProfits };
  }, [salesMetrics, productPerformance, cogsPercent]);

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

    if (activeSubTab === 'sales') {
      reportTitle = "Retailer Sales & Revenue Audit";
      const monthlyArray = Object.entries(salesMetrics.monthlySales);
      const categoryArray = Object.entries(salesMetrics.categorySales);

      contentHtml = `
        <div class="stats-strip">
          <div class="stat-box">
            <div class="stat-box-label">Gross Revenue</div>
            <div class="stat-box-val">₹${salesMetrics.grossSales.toFixed(2)}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Orders Completed</div>
            <div class="stat-box-val">${salesMetrics.successfulSales}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Avg Order Value</div>
            <div class="stat-box-val">₹${salesMetrics.avgOrderValue.toFixed(2)}</div>
          </div>
        </div>

        <h3>Monthly Revenue Trend</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <thead>
            <tr>
              <th>Month</th>
              <th style="text-align: right;">Sales Volume (₹)</th>
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

        <h3>Sales by Crop Category</h3>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Category</th>
              <th style="text-align: right;">Sales Volume (₹)</th>
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
    } else if (activeSubTab === 'inventory') {
      reportTitle = "Product Performance & Inventory Stock Audit";
      contentHtml = `
        <div class="stats-strip">
          <div class="stat-box">
            <div class="stat-box-label">Total Listings</div>
            <div class="stat-box-val">${productPerformance.activeListings}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Out of Stock</div>
            <div class="stat-box-val" style="color: #ef4444;">${productPerformance.outOfStock}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Restock Alerts</div>
            <div class="stat-box-val" style="color: #d97706;">${productPerformance.restockAlerts}</div>
          </div>
        </div>

        <h3>Product Performance Analytics</h3>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th style="text-align: right;">Units Sold</th>
              <th style="text-align: right;">Revenue</th>
              <th style="text-align: right;">Stock</th>
              <th style="text-align: right;">Turnover %</th>
            </tr>
          </thead>
          <tbody>
            ${productPerformance.list.map(p => `
              <tr>
                <td><strong>${p.title}</strong></td>
                <td style="text-transform: capitalize; color: #64748b;">${p.category}</td>
                <td style="text-align: right;">${p.unitsSold}</td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">₹${p.revenue.toFixed(2)}</td>
                <td style="text-align: right; color: ${p.stock <= 10 ? '#ef4444' : '#065f46'}; font-weight: 600;">${p.stock} ${p.stockUnit}</td>
                <td style="text-align: right; font-weight: bold;">${p.turnoverRate.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (activeSubTab === 'profit') {
      reportTitle = "Profitability Statement";
      contentHtml = `
        <div class="stats-strip">
          <div class="stat-box">
            <div class="stat-box-label">Net profit</div>
            <div class="stat-box-val" style="color: #059669;">₹${profitabilityMetrics.netProfit.toFixed(2)}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Profit Margin</div>
            <div class="stat-box-val">${profitabilityMetrics.profitMargin.toFixed(1)}%</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">COGS Applied</div>
            <div class="stat-box-val">${cogsPercent}%</div>
          </div>
        </div>

        <h3>Financial Breakdown</h3>
        <table style="width: 100%; margin-bottom: 20px;">
          <tbody>
            <tr>
              <td><strong>Gross Sales Revenue</strong></td>
              <td style="text-align: right; font-weight: 600;">₹${profitabilityMetrics.grossSales.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Platform Commission Fees (5%)</td>
              <td style="text-align: right; color: #dc2626;">- ₹${profitabilityMetrics.platformFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Estimated Cost of Goods Sold (${cogsPercent}%)</td>
              <td style="text-align: right; color: #dc2626;">- ₹${profitabilityMetrics.costOfGoods.toFixed(2)}</td>
            </tr>
            <tr style="background-color: #f0fdf4;">
              <td><strong>Net Operating Profit</strong></td>
              <td style="text-align: right; font-weight: bold; color: #059669; font-size: 14px;">₹${profitabilityMetrics.netProfit.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <h3>Product Contribution</h3>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th>Product Title</th>
              <th style="text-align: right;">Revenue</th>
              <th style="text-align: right;">Est. COGS</th>
              <th style="text-align: right;">Platform Commission</th>
              <th style="text-align: right;">Net Profit</th>
              <th style="text-align: right;">Margin %</th>
            </tr>
          </thead>
          <tbody>
            ${profitabilityMetrics.productProfits.map(p => `
              <tr>
                <td><strong>${p.title}</strong></td>
                <td style="text-align: right;">₹${p.revenue.toFixed(2)}</td>
                <td style="text-align: right; color: #dc2626;">₹${p.cogs.toFixed(2)}</td>
                <td style="text-align: right; color: #dc2626;">₹${p.platformFee.toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold; color: #059669;">₹${p.netProfit.toFixed(2)}</td>
                <td style="text-align: right;">${p.profitMargin.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const filename = `retailer_report_${activeSubTab}_${Date.now()}.pdf`;

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
                Report ID: <strong>AM-RTL-${Date.now().toString().substring(6)}</strong><br>
                Date Issued: <strong>${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</strong><br>
                Classification: <strong>Retailer Operations Statement</strong>
              </div>
            </div>

            ${contentHtml}

            <div class="footer">
              AgriMarket Retailer Operational Report.<br>
              This is a system generated document compiled from secure retailer sales ledger details.
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
          onClick={() => setActiveSubTab('sales')}
          className={`reports-sub-tab-btn ${activeSubTab === 'sales' ? 'active' : ''}`}
        >
          Sales & Revenue
        </button>
        <button 
          onClick={() => setActiveSubTab('inventory')}
          className={`reports-sub-tab-btn ${activeSubTab === 'inventory' ? 'active' : ''}`}
        >
          Product & Inventory
        </button>
        <button 
          onClick={() => setActiveSubTab('profit')}
          className={`reports-sub-tab-btn ${activeSubTab === 'profit' ? 'active' : ''}`}
        >
          Profitability
        </button>

        <button 
          className="reports-pdf-export-btn"
          onClick={handleDownloadPDF}
          disabled={exporting}
        >
          {exporting ? 'Compiling...' : 'Export PDF Report'}
        </button>
      </div>

      <div className="report-content-body">
        
        {activeSubTab === 'sales' && (
          <div className="report-panel-fade animate-fade-in">
            {/* KPI Metrics */}
            <div className="reports-kpi-grid">
              <div className="kpi-card">
                <span className="kpi-title">Gross Revenue</span>
                <span className="kpi-value text-emerald-600">₹{salesMetrics.grossSales.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="kpi-subtitle">Sum of successful orders</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Successful Sales</span>
                <span className="kpi-value text-slate-800 dark:text-slate-100">{salesMetrics.successfulSales}</span>
                <span className="kpi-subtitle">Completed orders counts</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Average Order Value</span>
                <span className="kpi-value text-blue-600">₹{salesMetrics.avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="kpi-subtitle">Revenue per order</span>
              </div>
            </div>

            {/* Visual Charts */}
            <div className="reports-charts-container-row">
              {/* Monthly Spending Trend Bar Chart */}
              <div className="report-chart-box">
                <h3 className="chart-title text-dark">Revenue Trend over Months</h3>
                {Object.keys(salesMetrics.monthlySales).length > 0 ? (
                  <div className="custom-bar-chart-widget">
                    {Object.entries(salesMetrics.monthlySales).map(([month, val]) => {
                      const maxVal = Math.max(...Object.values(salesMetrics.monthlySales)) || 1;
                      const heightPct = (val / maxVal) * 100;
                      return (
                        <div key={month} className="chart-bar-column">
                          <div className="chart-bar-fill-wrapper">
                            <div 
                              className="chart-bar-fill bg-emerald-500" 
                              style={{ height: `${heightPct}%` }}
                              title={`Revenue: ₹${val.toFixed(2)}`}
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
                  <div className="empty-chart-note text-muted">No sales revenue records to plot.</div>
                )}
              </div>

              {/* Category-wise Sales Progress */}
              <div className="report-chart-box">
                <h3 className="chart-title text-dark">Revenue by Crop Category</h3>
                {Object.keys(salesMetrics.categorySales).length > 0 ? (
                  <div className="category-spend-progress-list">
                    {Object.entries(salesMetrics.categorySales).map(([cat, val]) => {
                      const pctOfTotal = salesMetrics.grossSales > 0 ? (val / salesMetrics.grossSales) * 100 : 0;
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
                  <div className="empty-chart-note text-muted">No category sales records found.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'inventory' && (
          <div className="report-panel-fade animate-fade-in">
            {/* KPI Metrics */}
            <div className="reports-kpi-grid">
              <div className="kpi-card">
                <span className="kpi-title">Active Listings</span>
                <span className="kpi-value text-slate-800 dark:text-slate-100">{productPerformance.activeListings}</span>
                <span className="kpi-subtitle">Total products listed</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Out of Stock</span>
                <span className={`kpi-value ${productPerformance.outOfStock > 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>{productPerformance.outOfStock}</span>
                <span className="kpi-subtitle">Needs immediate replenishment</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Restock Alerts</span>
                <span className={`kpi-value ${productPerformance.restockAlerts > 0 ? 'text-amber-500' : 'text-slate-800 dark:text-slate-100'}`}>{productPerformance.restockAlerts}</span>
                <span className="kpi-subtitle">Listing stock level &lt;= 10</span>
              </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="desktop-table-layout scroll-wrapper">
              <table className="reports-data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Current Stock</th>
                    <th style={{ textAlign: 'right' }}>Units Sold</th>
                    <th style={{ textAlign: 'right' }}>Total Revenue</th>
                    <th style={{ textAlign: 'right' }}>Turnover Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {productPerformance.list.length > 0 ? (
                    productPerformance.list.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.title}</strong></td>
                        <td className="capitalize text-muted">{p.category}</td>
                        <td style={{ textAlign: 'right' }}>₹{p.price.toFixed(2)}</td>
                        <td style={{ textAlign: 'right' }}>
                          <span className={`status-badge-pill ${p.stock === 0 ? 'cancelled' : p.stock <= 10 ? 'pending' : 'delivered'}`}>
                            {p.stock} {p.stockUnit}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>{p.unitsSold}</td>
                        <td style={{ textAlign: 'right' }} className="font-bold text-slate-800 dark:text-slate-100">₹{p.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        <td style={{ textAlign: 'right' }} className="font-bold text-emerald-600">{p.turnoverRate.toFixed(0)}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-muted">No products found to analyze.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid View */}
            <div className="mobile-cards-layout">
              {productPerformance.list.length > 0 ? (
                productPerformance.list.map(p => (
                  <div key={p.id} className="mobile-order-card">
                    <div className="card-top-row">
                      <span className="card-order-id font-bold">{p.title}</span>
                      <span className={`status-badge-pill ${p.stock === 0 ? 'cancelled' : p.stock <= 10 ? 'pending' : 'delivered'}`}>
                        Stock: {p.stock} {p.stockUnit}
                      </span>
                    </div>
                    <div className="card-details-list">
                      <div className="card-detail-item">
                        <span className="detail-lbl text-muted">Category:</span>
                        <span className="detail-val capitalize">{p.category}</span>
                      </div>
                      <div className="card-detail-item">
                        <span className="detail-lbl text-muted">Price:</span>
                        <span className="detail-val">₹{p.price}</span>
                      </div>
                      <div className="card-detail-item">
                        <span className="detail-lbl text-muted">Units Sold:</span>
                        <span className="detail-val">{p.unitsSold}</span>
                      </div>
                      <div className="card-detail-item">
                        <span className="detail-lbl text-muted">Turnover Rate:</span>
                        <span className="detail-val text-emerald-600 font-bold">{p.turnoverRate.toFixed(1)}%</span>
                      </div>
                      <div className="card-detail-item border-t border-slate-100 dark:border-zinc-800 pt-2 mt-2">
                        <span className="detail-lbl text-muted font-bold">Total Revenue:</span>
                        <span className="detail-val font-bold text-slate-800 dark:text-slate-100">₹{p.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-cards-note text-center py-8 text-muted">No product listings found.</div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'profit' && (
          <div className="report-panel-fade animate-fade-in">
            {/* COGS Slider Controls */}
            <div className="profitability-control-card">
              <div className="slider-header-meta">
                <span className="control-lbl font-bold text-dark">Estimated Cost of Production / Goods (COGS)</span>
                <span className="control-val bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-bold">{cogsPercent}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={cogsPercent} 
                onChange={(e) => setCogsPercent(Number(e.target.value))} 
                className="cogs-slider-bar"
              />
              <p className="slider-hint text-muted">
                Adjust this slider to estimate your costs (seeds, labor, fertilizer, packaging) and dynamically calculate your profit margins.
              </p>
            </div>

            {/* KPI Metrics */}
            <div className="reports-kpi-grid">
              <div className="kpi-card">
                <span className="kpi-title">Gross Revenue</span>
                <span className="kpi-value text-slate-800 dark:text-slate-100">₹{profitabilityMetrics.grossSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="kpi-subtitle">Total sales amount</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Est. Platform Fee (5%)</span>
                <span className="kpi-value text-red-500">₹{profitabilityMetrics.platformFee.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="kpi-subtitle">Platform listing commission</span>
              </div>
              <div className="kpi-card">
                <span className="kpi-title">Est. Net Profit</span>
                <span className="kpi-value text-emerald-600">₹{profitabilityMetrics.netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="kpi-subtitle">Operating Profit Margin: <strong>{profitabilityMetrics.profitMargin.toFixed(1)}%</strong></span>
              </div>
            </div>

            {/* Product profitability list */}
            <div className="report-chart-box">
              <h3 className="chart-title text-dark">Product Profitability Breakdown</h3>
              <div className="desktop-table-layout scroll-wrapper">
                <table className="reports-data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ textAlign: 'right' }}>Revenue</th>
                      <th style={{ textAlign: 'right' }}>Est. COGS ({cogsPercent}%)</th>
                      <th style={{ textAlign: 'right' }}>Platform Commission (5%)</th>
                      <th style={{ textAlign: 'right' }}>Est. Net Profit</th>
                      <th style={{ textAlign: 'right' }}>Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitabilityMetrics.productProfits.length > 0 ? (
                      profitabilityMetrics.productProfits.map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.title}</strong></td>
                          <td style={{ textAlign: 'right' }}>₹{p.revenue.toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }} className="text-red-500">-₹{p.cogs.toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }} className="text-red-500">-₹{p.platformFee.toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }} className="font-bold text-emerald-600">₹{p.netProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td style={{ textAlign: 'right' }} className="font-bold">{p.profitMargin.toFixed(1)}%</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center py-6 text-muted">No sales data for products to analyze.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Product Profitability List */}
              <div className="mobile-cards-layout">
                {profitabilityMetrics.productProfits.length > 0 ? (
                  profitabilityMetrics.productProfits.map(p => (
                    <div key={p.id} className="mobile-order-card">
                      <div className="card-top-row">
                        <span className="card-order-id font-bold">{p.title}</span>
                        <span className="status-badge-pill delivered">Margin: {p.profitMargin.toFixed(0)}%</span>
                      </div>
                      <div className="card-details-list">
                        <div className="card-detail-item">
                          <span className="detail-lbl text-muted">Revenue:</span>
                          <span className="detail-val">₹{p.revenue.toLocaleString()}</span>
                        </div>
                        <div className="card-detail-item">
                          <span className="detail-lbl text-muted">Est. COGS:</span>
                          <span className="detail-val text-red-500">-₹{p.cogs.toLocaleString()}</span>
                        </div>
                        <div className="card-detail-item">
                          <span className="detail-lbl text-muted">Platform Fee:</span>
                          <span className="detail-val text-red-500">-₹{p.platformFee.toLocaleString()}</span>
                        </div>
                        <div className="card-detail-item border-t border-slate-100 dark:border-zinc-800 pt-2 mt-2">
                          <span className="detail-lbl text-muted font-bold">Est. Net Profit:</span>
                          <span className="detail-val font-bold text-emerald-600">₹{p.netProfit.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-cards-note text-center py-6 text-muted">No sales records to analyze.</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
