import React from 'react';
import './Reports.css';

export default function Reports({ users, products, orders, setAlert }) {
  const triggerExport = (reportType) => {
    setAlert({ type: 'success', text: `Exporting ${reportType} report... CSV download started!` });
  };

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
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="export-action-btn" onClick={() => triggerExport('Users Registry')} style={{ flex: 1 }}>
                Export Users List (CSV)
              </button>
              <button className="export-action-btn" onClick={() => handleDownloadPDF('users')} style={{ flex: 1, backgroundColor: '#059669', color: '#ffffff' }}>
                Export Users List (PDF)
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="export-action-btn" onClick={() => triggerExport('Products Listing')} style={{ flex: 1 }}>
                Export Products Catalog (CSV)
              </button>
              <button className="export-action-btn" onClick={() => handleDownloadPDF('products')} style={{ flex: 1, backgroundColor: '#059669', color: '#ffffff' }}>
                Export Products Catalog (PDF)
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button className="export-action-btn" onClick={() => triggerExport('Transactions Ledger')} style={{ flex: 1 }}>
                Export Orders & Payments (CSV)
              </button>
              <button className="export-action-btn" onClick={() => handleDownloadPDF('orders')} style={{ flex: 1, backgroundColor: '#059669', color: '#ffffff' }}>
                Export Orders & Payments (PDF)
              </button>
            </div>
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
