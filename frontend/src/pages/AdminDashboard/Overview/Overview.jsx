import React from 'react';
import './Overview.css';

export default function Overview({ 
  users, 
  products, 
  orders, 
  platformEarnings, 
  setActiveTab,
  setAlert
}) {
  const totalSellers = users.filter(u => u.role === 'retailer' || u.role === 'farmer').length;
  const totalBuyers = users.filter(u => u.role === 'buyer').length;

  const totalSales = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + Number(o.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;

  const handleDownloadPDF = (type) => {
    setAlert({ type: 'success', text: `Compiling ${type} PDF report... download starting soon!` });

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
      }
    };
    window.addEventListener('message', handleMessage);
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();

    let reportTitle = "";
    let dataHtml = "";
    let statsHtml = "";

    if (type === 'users') {
      reportTitle = "Users Registry Statement";
      const totalUsers = users.length;
      const buyersCount = users.filter(u => u.role === 'buyer').length;
      const farmersCount = users.filter(u => u.role === 'farmer').length;
      const retailersCount = users.filter(u => u.role === 'retailer').length;

      statsHtml = `
        <div class="stats-strip">
          <div class="stat-box">
            <div class="stat-box-label">Total Users</div>
            <div class="stat-box-val">${totalUsers}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Buyers</div>
            <div class="stat-box-val">${buyersCount}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Farmers</div>
            <div class="stat-box-val">${farmersCount}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Retailers</div>
            <div class="stat-box-val">${retailersCount}</div>
          </div>
        </div>
      `;

      dataHtml = `
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 25%;">User ID</th>
              <th style="width: 30%;">Full Name</th>
              <th style="width: 30%;">Email Address</th>
              <th style="width: 15%;">Role</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td><strong>${u.id || u._id || 'N/A'}</strong></td>
                <td>${u.fullName || 'N/A'}</td>
                <td>${u.email}</td>
                <td style="text-transform: uppercase; font-weight: 600; color: #065f46;">${u.role}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'products') {
      reportTitle = "Products Catalog Audit";
      const totalProducts = products.length;
      const outOfStockCount = products.filter(p => p.stock === 0).length;

      statsHtml = `
        <div class="stats-strip">
          <div class="stat-box">
            <div class="stat-box-label">Total Listings</div>
            <div class="stat-box-val">${totalProducts}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Out of Stock</div>
            <div class="stat-box-val">${outOfStockCount}</div>
          </div>
        </div>
      `;

      dataHtml = `
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 35%;">Title</th>
              <th style="width: 20%;">Category</th>
              <th style="width: 15%; text-align: right;">Price</th>
              <th style="width: 15%; text-align: right;">Stock</th>
              <th style="width: 15%;">Location</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td style="font-weight: 600;">${p.title || p.name || 'N/A'}</td>
                <td style="text-transform: uppercase; font-size: 11px; color: #64748b;">${p.category || 'N/A'}</td>
                <td style="text-align: right; font-weight: 600;">₹${p.price}</td>
                <td style="text-align: right; color: ${p.stock === 0 ? '#ef4444' : '#065f46'}; font-weight: 600;">
                  ${p.stock}
                </td>
                <td>${p.location || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'orders') {
      reportTitle = "Transactions Ledger Report";
      const totalOrdersCount = orders.length;
      const activeOrders = orders.filter(o => o.status !== 'cancelled');
      const totalRevenueValue = activeOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
      const avgValue = totalOrdersCount > 0 ? (totalRevenueValue / totalOrdersCount) : 0;

      statsHtml = `
        <div class="stats-strip">
          <div class="stat-box">
            <div class="stat-box-label">Total Orders</div>
            <div class="stat-box-val">${totalOrdersCount}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Total Revenue</div>
            <div class="stat-box-val">₹${totalRevenueValue.toLocaleString()}</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-box">
            <div class="stat-box-label">Average Order Value</div>
            <div class="stat-box-val">₹${Math.round(avgValue).toLocaleString()}</div>
          </div>
        </div>
      `;

      dataHtml = `
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 20%;">Order ID</th>
              <th style="width: 15%;">Date</th>
              <th style="width: 20%;">Buyer Name</th>
              <th style="width: 25%;">Product Detail</th>
              <th style="width: 10%; text-align: right;">Total</th>
              <th style="width: 10%;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.date}</td>
                <td>${o.buyerName}</td>
                <td>${o.productName} (x${o.quantity} ${o.unit || 'Kg'})</td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">₹${Number(o.total || 0).toLocaleString()}</td>
                <td style="text-transform: uppercase; font-size: 11px; font-weight: 700; color: ${o.status === 'cancelled' ? '#ef4444' : '#10b981'};">
                  ${o.status}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const filename = `admin_${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;

    const htmlString = `
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              color: #334155; 
              background-color: #f8fafc;
              margin: 0;
            }
            .invoice-card { 
              max-width: 720px; 
              margin: 0 auto; 
              border: 1px solid #e2e8f0; 
              border-radius: 12px; 
              padding: 30px; 
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); 
              background-color: #ffffff;
              box-sizing: border-box;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              border-bottom: 2px solid #10b981; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .logo { 
              font-size: 28px; 
              font-weight: 800; 
              color: #065f46; 
              letter-spacing: -0.5px; 
            }
            .logo span { 
              color: #10b981; 
            }
            .title { 
              font-size: 14px; 
              color: #64748b; 
              text-align: right; 
              line-height: 1.5; 
            }
            .details { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 30px; 
              line-height: 1.6; 
              font-size: 14px; 
            }
            .col { 
              flex: 1; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 30px; 
              font-size: 12px; 
              table-layout: fixed;
            }
            th, td { 
              padding: 10px 12px; 
              border-bottom: 1px solid #f1f5f9; 
              text-align: left; 
              word-wrap: break-word;
            }
            th { 
              background-color: #f0fdf4; 
              color: #065f46; 
              font-weight: 700; 
              text-transform: uppercase;
              font-size: 10px;
              letter-spacing: 0.5px;
            }
            .stats-strip {
              background-color: #f0fdf4;
              border: 1px solid rgba(16, 185, 129, 0.2);
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              gap: 10px;
            }
            .stat-box {
              flex: 1;
              text-align: center;
            }
            .stat-box-label {
              font-size: 10px;
              font-weight: bold;
              color: #065f46;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .stat-box-val {
              font-size: 16px;
              font-weight: 800;
              color: #0f172a;
            }
            .stat-divider {
              border-left: 1px solid rgba(16, 185, 129, 0.2);
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
          <div class="invoice-card" id="pdf-report-content">
            <div class="header">
              <div>
                <div class="logo">Agri<span>Market</span></div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Direct Farm-to-Consumer Marketplace</div>
              </div>
              <div class="title">
                <strong style="font-size: 18px; color: #0f172a; text-transform: uppercase;">${reportTitle}</strong><br>
                Report ID: <strong>AM-ARP-${Date.now().toString().substring(6)}</strong><br>
                Date Issued: <strong>${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</strong><br>
                Source: Platform Administrator database
              </div>
            </div>

            <div class="details">
              <div class="col">
                <strong style="color: #0f172a; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Report Scope:</strong><br>
                <span style="font-weight: 600; font-size: 14px; color: #0f172a; display: block; margin: 4px 0;">Platform Global Audit</span>
                Auditor: Administrator Account<br>
                System Status: Verified Online
              </div>
            </div>

            ${statsHtml}
            ${dataHtml}

            <div class="footer">
              AgriMarket Platform Management Report.<br>
              This is a system generated document compiled from secure platform database records.
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
          html2canvas:  { 
            scale: 2, 
            useCORS: true,
            scrollY: 0,
            scrollX: 0,
            windowWidth: 800
          },
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
    <div className="admin-overview-view">
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-icon-wrapper blue">
            <img src="/src/assets/icons/group.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{users.length}</span>
            <span className="stat-label text-muted">Total Users</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper green">
            <img src="/src/assets/icons/sprout.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{totalSellers}</span>
            <span className="stat-label text-muted">Active Retailers</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper orange">
            <img src="/src/assets/icons/shopping-bag.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{totalBuyers}</span>
            <span className="stat-label text-muted">Registered Buyers</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper wheat">
            <img src="/src/assets/icons/wheat.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{products.length}</span>
            <span className="stat-label text-muted">Live Products</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper purple">
            <img src="/src/assets/icons/delivery.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">{orders.length}</span>
            <span className="stat-label text-muted">Total Orders</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="stat-icon-wrapper gold">
            <img src="/src/assets/icons/rupee.png" alt="" className="admin-stat-icon" />
          </div>
          <div className="stat-details">
            <span className="stat-value text-dark">₹{platformEarnings.toFixed(2)}</span>
            <span className="stat-label text-muted">Commissions Earned</span>
          </div>
        </div>
      </div>

      <div className="admin-split-layout">
        <div className="dashboard-card">
          <div className="card-header-row">
            <h3 className="text-dark">Recent System Events</h3>
            <button className="view-all-link-btn" onClick={() => setActiveTab('users')}>
              Manage Accounts
            </button>
          </div>
          <div className="system-logs-list">
            {(() => {
              const logs = [];
              
              // 1. User registrations
              users.slice(0, 2).forEach(u => {
                logs.push({
                  type: 'USER REG',
                  badgeClass: 'success',
                  text: <>New {u.role} <strong>{u.fullName}</strong> registered.</>,
                  time: 'Recently'
                });
              });

              // 2. Orders placed
              orders.slice(0, 2).forEach(o => {
                logs.push({
                  type: 'ORDER PLACED',
                  badgeClass: 'info',
                  text: <>Order placed for <strong>{o.productName}</strong> by <strong>{o.buyerName}</strong>.</>,
                  time: 'Recently'
                });
              });

              // 3. Stock warnings
              products.filter(p => p.stock <= 10).slice(0, 2).forEach(p => {
                logs.push({
                  type: 'STOCK ALERT',
                  badgeClass: 'warning',
                  text: <>Listing <strong>{p.title}</strong> is low on stock ({p.stock} remaining).</>,
                  time: 'Alert'
                });
              });

              if (logs.length === 0) {
                return (
                  <div className="text-center py-6 text-muted text-sm">
                    No recent system events.
                  </div>
                );
              }

              return logs.map((log, index) => (
                <div key={index} className="log-item">
                  <span className={`log-badge ${log.badgeClass}`}>{log.type}</span>
                  <span className="log-text text-dark">{log.text}</span>
                  <span className="log-time text-muted">{log.time}</span>
                </div>
              ));
            })()}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="dashboard-card">
            <div className="card-header-row">
              <h3 className="text-dark">Quick Platform Actions</h3>
            </div>
            <div className="quick-actions-grid">
              <button className="quick-btn" onClick={() => setActiveTab('users')}>
                Approve Retailers
              </button>
              <button className="quick-btn" onClick={() => setActiveTab('products')}>
                Moderate Items
              </button>
              <button className="quick-btn" onClick={() => setActiveTab('payments')}>
                Release Payouts
              </button>
              <button className="quick-btn" onClick={() => setActiveTab('settings')}>
                Adjust Fee Rate
              </button>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header-row">
              <h3 className="text-dark">Export Data Reports</h3>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button className="quick-btn w-full flex items-center gap-2" onClick={() => handleDownloadPDF('users')} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                <img src="/src/assets/icons/group.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                <span>Export Users Registry (PDF)</span>
              </button>
              <button className="quick-btn w-full flex items-center gap-2" onClick={() => handleDownloadPDF('products')} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                <img src="/src/assets/icons/wheat.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                <span>Export Products Catalog (PDF)</span>
              </button>
              <button className="quick-btn w-full flex items-center gap-2" onClick={() => handleDownloadPDF('orders')} style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                <img src="/src/assets/icons/rupee.png" alt="" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                <span>Export Orders & Payments (PDF)</span>
              </button>
            </div>
            <div className="text-xs text-muted mt-3" style={{ borderTop: '1px solid rgba(82, 183, 136, 0.1)', paddingTop: '8px' }}>
              • Average Order Value: <strong>₹{avgOrderValue.toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
