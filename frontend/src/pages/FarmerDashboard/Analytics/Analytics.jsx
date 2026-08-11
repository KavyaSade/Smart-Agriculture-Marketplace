import React, { useState, useRef, useEffect } from 'react';
import { IndianRupee, ShoppingBag, BarChart3, Package, Calendar, Download } from 'lucide-react';
import './Analytics.css';

const Analytics = ({ orders = [], products = [] }) => {
  const [activeModal, setActiveModal] = useState(null); // 'revenue', 'sales', 'volume', 'average' or null
  const svgRef = useRef(null);
  const [chartPngUrl, setChartPngUrl] = useState(null);

  // 1. Filter out cancelled orders for revenue reporting
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const getProductCategory = (productId) => {
    const prod = products.find(p => p._id === productId);
    return prod ? (prod.category || 'grains').toLowerCase() : 'grains';
  };

  const getProductImage = (productId) => {
    const prod = products.find(p => p._id === productId);
    return prod ? prod.image : '';
  };

  // 2. Aggregate Sales Performance by individual Crop
  const cropSalesMap = {};
  validOrders.forEach(order => {
    const key = order.productId || order.productName;
    if (!cropSalesMap[key]) {
      cropSalesMap[key] = {
        id: order.productId,
        name: order.productName,
        category: getProductCategory(order.productId),
        image: getProductImage(order.productId),
        quantity: 0,
        unit: order.unit || 'Kg',
        revenue: 0,
        ordersCount: 0
      };
    }
    cropSalesMap[key].quantity += Number(order.quantity || 0);
    cropSalesMap[key].revenue += Number(order.amount || 0);
    cropSalesMap[key].ordersCount += 1;
  });

  const cropSalesList = Object.values(cropSalesMap).sort((a, b) => b.revenue - a.revenue);

  // 3. Overall Statistics
  const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const totalQuantity = validOrders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
  const totalOrdersCount = validOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;

  // 4. Monthly Aggregates
  const getMonthYearKey = (order) => {
    let dateObj;
    if (order.createdAt) {
      dateObj = new Date(order.createdAt);
    } else {
      dateObj = new Date(order.date);
    }
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date();
    }
    const monthName = dateObj.toLocaleString('en-US', { month: 'short' });
    const year = dateObj.getFullYear();
    const monthNum = dateObj.getMonth();
    return {
      key: `${monthName} ${year}`,
      monthNum,
      year,
      monthName
    };
  };

  const monthlyData = {};
  validOrders.forEach(order => {
    const { key, monthNum, year, monthName } = getMonthYearKey(order);
    if (!monthlyData[key]) {
      monthlyData[key] = {
        key,
        monthNum,
        year,
        monthName,
        revenue: 0,
        ordersCount: 0,
        inventoryDispatched: 0
      };
    }
    monthlyData[key].revenue += Number(order.amount || 0);
    monthlyData[key].ordersCount += 1;
    monthlyData[key].inventoryDispatched += Number(order.quantity || 0);
  });

  const sortedMonths = Object.values(monthlyData).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.monthNum - b.monthNum;
  });

  const maxRevenue = Math.max(...sortedMonths.map(m => m.revenue)) || 1000;

  // Map monthly data to line coordinates (only utilized if multi-month records are present)
  const chartWidth = 440;
  const chartHeight = 130;
  const startX = 40;
  const startY = 150;
  
  const points = sortedMonths.map((m, idx) => {
    const x = startX + (sortedMonths.length > 1 ? (idx / (sortedMonths.length - 1)) * chartWidth : chartWidth / 2);
    const y = startY - (m.revenue / maxRevenue) * chartHeight;
    return { x, y, ...m };
  });

  let pathD = '';
  let areaD = '';
  if (points.length > 1) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
    areaD = `${pathD} L ${points[points.length - 1].x} ${startY} L ${points[0].x} ${startY} Z`;
  }

  useEffect(() => {
    if (sortedMonths.length > 1 && svgRef.current) {
      const timer = setTimeout(() => {
        try {
          const svgEl = svgRef.current;
          
          if (!svgEl.getAttribute('xmlns')) {
            svgEl.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          }

          const svgString = new XMLSerializer().serializeToString(svgEl);
          const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1000;
            canvas.height = 360;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              const pngData = canvas.toDataURL('image/png');
              setChartPngUrl(pngData);
            }
            URL.revokeObjectURL(url);
          };
          img.onerror = (e) => {
            console.error("Error loading SVG image for PNG conversion:", e);
            URL.revokeObjectURL(url);
          };
          img.src = url;
        } catch (err) {
          console.error("Failed to convert SVG to PNG:", err);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [orders, products]);

  // 5. Category Distribution Aggregates
  const categorySales = { grains: 0, fruits: 0, dairy: 0, spices: 0 };
  validOrders.forEach(order => {
    let cat = getProductCategory(order.productId);
    if (cat.includes('fruit') || cat.includes('veg')) {
      cat = 'fruits';
    } else if (cat.includes('dairy')) {
      cat = 'dairy';
    } else if (cat.includes('spice')) {
      cat = 'spices';
    } else {
      cat = 'grains';
    }
    categorySales[cat] += Number(order.amount || 0);
  });

  let finalCategoryShares = { grains: 0, fruits: 0, dairy: 0, spices: 0 };
  if (totalRevenue > 0) {
    Object.keys(categorySales).forEach(cat => {
      finalCategoryShares[cat] = Math.round((categorySales[cat] / totalRevenue) * 100);
    });
  } else {
    
    const productCounts = { grains: 0, fruits: 0, dairy: 0, spices: 0 };
    products.forEach(p => {
      let cat = (p.category || 'grains').toLowerCase();
      if (cat.includes('fruit') || cat.includes('veg')) cat = 'fruits';
      else if (cat.includes('dairy')) cat = 'dairy';
      else if (cat.includes('spice')) cat = 'spices';
      else cat = 'grains';
      productCounts[cat] += 1;
    });
    const totalProds = Object.values(productCounts).reduce((a, b) => a + b, 0);
    if (totalProds > 0) {
      Object.keys(productCounts).forEach(cat => {
        finalCategoryShares[cat] = Math.round((productCounts[cat] / totalProds) * 100);
      });
    } else {
      finalCategoryShares = { grains: 25, fruits: 25, dairy: 25, spices: 25 };
    }
  }

  const statements = [...sortedMonths].reverse();

  // 6. Modal details selection helper
  const getModalTitle = () => {
    switch (activeModal) {
      case 'revenue': return 'Revenue Ledger Statement';
      case 'sales': return 'Successful Sales Log';
      case 'volume': return 'Volume Dispatched Breakdown';
      case 'average': return 'Average Order Value (AOV) Audit';
      default: return 'Data Details';
    }
  };

  // 7. Dynamic PDF Report Generation & Direct Download Flow
  const handleDownloadPDF = (type = 'full') => {
    
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '0px';
    iframe.style.width = '800px';
    iframe.style.height = '1200px';
    iframe.style.border = 'none';

    // Cleanup and remove iframe on download finish trigger
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

    //subpage content
    if (type === 'revenue') {
      reportTitle = "Revenue Ledger Statement";
      dataHtml = `
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 18%;">Date</th>
              <th style="width: 17%;">Order ID</th>
              <th style="width: 30%;">Product Details</th>
              <th style="width: 20%;">Buyer Name</th>
              <th style="width: 15%; text-align: right;">Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${validOrders.map(o => `
              <tr>
                <td>${o.date}</td>
                <td><strong>${o.id}</strong></td>
                <td>${o.productName} (x${o.quantity})</td>
                <td>${o.buyerName}</td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">₹${o.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'sales') {
      reportTitle = "Successful Sales Log";
      dataHtml = `
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 18%;">Order ID</th>
              <th style="width: 17%;">Date</th>
              <th style="width: 30%;">Product Details</th>
              <th style="width: 23%;">Buyer Name & Contact</th>
              <th style="width: 12%; text-align: right;">Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${validOrders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.date}</td>
                <td>${o.productName}</td>
                <td>${o.buyerName} (${o.buyerEmail})</td>
                <td style="text-align: right; font-weight: 600;">${o.quantity} ${o.unit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'volume') {
      reportTitle = "Volume Dispatched Breakdown";
      dataHtml = `
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 40%;">Crop Description</th>
              <th style="width: 20%;">Category</th>
              <th style="width: 20%; text-align: right;">Volume Dispatched</th>
              <th style="width: 20%; text-align: right;">Sales Count</th>
            </tr>
          </thead>
          <tbody>
            ${cropSalesList.map(c => `
              <tr>
                <td style="font-weight: 600; color: #0f172a;">${c.name}</td>
                <td style="text-transform: uppercase; color: #64748b; font-size: 11px;">${c.category}</td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">${c.quantity} ${c.unit}</td>
                <td style="text-align: right; color: #475569;">${c.ordersCount} sales</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else if (type === 'average') {
      reportTitle = "Average Order Value (AOV) Audit";
      dataHtml = `
        <div class="summary-box">
          <h4 style="margin-top: 0; color: #065f46; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Calculation Summary</h4>
          <p>Total Revenue generated: <strong style="color: #0f172a;">₹${totalRevenue.toLocaleString()}</strong></p>
          <p>Successful Orders count: <strong style="color: #0f172a;">${totalOrdersCount} orders</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 14px; border-top: 1px dashed rgba(16, 185, 129, 0.3); padding-top: 8px; font-weight: bold; color: #065f46; display: flex; justify-content: space-between;">
            <span>Average Value Per Order (AOV):</span>
            <span>₹${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 20%;">Order ID</th>
              <th style="width: 40%;">Product Name</th>
              <th style="width: 20%;">Date</th>
              <th style="width: 20%; text-align: right;">Transaction Value</th>
            </tr>
          </thead>
          <tbody>
            ${validOrders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.productName}</td>
                <td>${o.date}</td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">₹${o.amount.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      // Full report
      reportTitle = "Sales & Financial Growth Report";
      dataHtml = `
        <h3 style="color: #065f46; border-bottom: 2px solid rgba(16, 185, 129, 0.2); padding-bottom: 5px; font-size: 14px; margin-top: 30px; text-transform: uppercase; letter-spacing: 0.5px;">Crop Sales Performance</h3>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 35%;">Crop Description</th>
              <th style="width: 15%;">Category</th>
              <th style="width: 15%; text-align: right;">Quantity Sold</th>
              <th style="width: 15%; text-align: right;">Sales Count</th>
              <th style="width: 20%; text-align: right;">Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${cropSalesList.map(c => `
              <tr>
                <td style="font-weight: 600; color: #0f172a;">${c.name}</td>
                <td style="text-transform: uppercase; font-size: 10px; color: #64748b;">${c.category}</td>
                <td style="text-align: right;">${c.quantity} ${c.unit}</td>
                <td style="text-align: right; color: #64748b;">${c.ordersCount} sales</td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">₹${c.revenue.toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h3 style="color: #065f46; border-bottom: 2px solid rgba(16, 185, 129, 0.2); padding-bottom: 5px; font-size: 14px; margin-top: 30px; text-transform: uppercase; letter-spacing: 0.5px;">Crop Category Share Breakdown</h3>
        <ul style="padding-left: 20px; line-height: 1.8; font-size: 14px; color: #334155; margin-top: 10px;">
          <li>Grains: <strong>${finalCategoryShares.grains}%</strong></li>
          <li>Fruits & Vegetables: <strong>${finalCategoryShares.fruits}%</strong></li>
          <li>Dairy Products: <strong>${finalCategoryShares.dairy}%</strong></li>
          <li>Spices: <strong>${finalCategoryShares.spices}%</strong></li>
        </ul>

        <h3 style="color: #065f46; border-bottom: 2px solid rgba(16, 185, 129, 0.2); padding-bottom: 5px; font-size: 14px; margin-top: 30px; text-transform: uppercase; letter-spacing: 0.5px;">Monthly Historical Statements</h3>
        <table style="width: 100%;">
          <thead>
            <tr>
              <th style="width: 30%;">Month</th>
              <th style="width: 20%; text-align: right;">Orders Count</th>
              <th style="width: 25%; text-align: right;">Revenue</th>
              <th style="width: 25%; text-align: right;">Inventory Dispatched</th>
            </tr>
          </thead>
          <tbody>
            ${statements.map(s => `
              <tr>
                <td><strong>${s.key}</strong></td>
                <td style="text-align: right; color: #64748b;">${s.ordersCount} Orders</td>
                <td style="text-align: right; font-weight: 600; color: #065f46;">₹${s.revenue.toLocaleString()}</td>
                <td style="text-align: right;">${s.inventoryDispatched} Kg</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    const filename = `${reportTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.pdf`;

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
              font-size: 14px; 
              table-layout: fixed;
            }
            th, td { 
              padding: 12px 16px; 
              border-bottom: 1px solid #f1f5f9; 
              text-align: left; 
              word-wrap: break-word;
            }
            th { 
              background-color: #f0fdf4; 
              color: #065f46; 
              font-weight: 700; 
              text-transform: uppercase;
              font-size: 11px;
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
            .summary-box {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
              margin-bottom: 30px;
            }
            .summary-box p {
              margin: 5px 0;
              font-size: 14px;
              color: #475569;
            }
            .footer { 
              text-align: center; 
              margin-top: 50px; 
              font-size: 12px; 
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
                <strong style="font-size: 20px; color: #0f172a; text-transform: uppercase;">${reportTitle}</strong><br>
                Report ID: <strong>AM-FRP-${Date.now().toString().substring(6)}</strong><br>
                Date Issued: <strong>${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}</strong><br>
                Source Ledger: Database verified
              </div>
            </div>

            <div class="details">
              <div class="col">
                <strong style="color: #0f172a; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Report Scope:</strong><br>
                <span style="font-weight: 600; font-size: 15px; color: #0f172a; display: block; margin: 4px 0;">Farmer Dashboard Sales</span>
                Currency: INR (₹)<br>
                Market Source: Live AgriMarket Orders
              </div>
              <div class="col" style="text-align: right;">
                <strong style="color: #0f172a; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Farmer Account:</strong><br>
                <span style="font-weight: 600; font-size: 15px; color: #0f172a; display: block; margin: 4px 0;">Verified Active Seller</span>
                Status: Active Ledger
              </div>
            </div>

            <div class="stats-strip">
              <div class="stat-box">
                <div class="stat-box-label">Total Revenue</div>
                <div class="stat-box-val">₹${totalRevenue.toLocaleString()}</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-box">
                <div class="stat-box-label">Successful Sales</div>
                <div class="stat-box-val">${totalOrdersCount}</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-box">
                <div class="stat-box-label">Volume Dispatched</div>
                <div class="stat-box-val">${totalQuantity.toLocaleString()} Kg</div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-box">
                <div class="stat-box-label">Avg Order Value</div>
                <div class="stat-box-val">₹${Math.round(avgOrderValue).toLocaleString()}</div>
              </div>
            </div>
            
            ${dataHtml}

            <div class="footer">
              Thank you for supporting local farmers and organic agriculture.<br>
              This is a system generated report and does not require a physical signature.
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
    <div className="analytics-container">
      {/* 1. Header with Download PDF Trigger */}
      <div className="card-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Financial Growth Report</h2>
        <button 
          onClick={() => handleDownloadPDF('full')} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#2d6a4f',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'background-color 0.2s'
          }}
          title="Directly download full sales report as a non-editable PDF"
        >
          <Download size={15} />
          <span>Download PDF Report</span>
        </button>
      </div>

      {/* 2. Header Summary Cards */}
      <section className="analytics-stats-grid">
        <div className="analytics-stat-card" onClick={() => setActiveModal('revenue')} title="Click to view detailed revenue ledger">
          <div className="stat-card-icon-wrapper icon-revenue">
            <IndianRupee size={24} />
          </div>
          <div className="stat-card-details">
            <span className="stat-card-value">₹{totalRevenue.toLocaleString()}</span>
            <span className="stat-card-title">Total Revenue</span>
          </div>
        </div>

        <div className="analytics-stat-card" onClick={() => setActiveModal('sales')} title="Click to view successful orders log">
          <div className="stat-card-icon-wrapper icon-sales-count">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-card-details">
            <span className="stat-card-value">{totalOrdersCount}</span>
            <span className="stat-card-title">Successful Sales</span>
          </div>
        </div>

        <div className="analytics-stat-card" onClick={() => setActiveModal('volume')} title="Click to view volume sold by crop">
          <div className="stat-card-icon-wrapper icon-volume">
            <Package size={24} />
          </div>
          <div className="stat-card-details">
            <span className="stat-card-value">{totalQuantity.toLocaleString()} Kg</span>
            <span className="stat-card-title">Volume Sold</span>
          </div>
        </div>

        <div className="analytics-stat-card" onClick={() => setActiveModal('average')} title="Click to view average order audit breakdown">
          <div className="stat-card-icon-wrapper icon-average">
            <BarChart3 size={24} />
          </div>
          <div className="stat-card-details">
            <span className="stat-card-value">
              ₹{avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
            <span className="stat-card-title">Avg Order Value</span>
          </div>
        </div>
      </section>

      {/* 3. Structured Crop-wise Performance & Category Share Breakdown */}
      <div className="analytics-main-grid">
        <div className="analytics-card-large">
          <div className="card-header-new">
            <h3>Crop Sales Performance</h3>
            <span className="card-header-badge">Live Ledger</span>
          </div>
          
          <div className="crop-performance-table-wrapper">
            {cropSalesList.length > 0 ? (
              <table className="crop-performance-table">
                <thead>
                  <tr>
                    <th>Crop Name & Category</th>
                    <th className="text-right">Qty Sold</th>
                    <th className="text-right">Orders</th>
                    <th className="text-right">Revenue Generated</th>
                    <th className="text-right">Sales Share</th>
                  </tr>
                </thead>
                <tbody>
                  {cropSalesList.map((crop, idx) => {
                    const share = totalRevenue > 0 ? Math.round((crop.revenue / totalRevenue) * 100) : 0;
                    return (
                      <tr key={idx}>
                        <td>
                          <div className="crop-info-cell">
                            <img 
                              src={crop.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=100'} 
                              alt={crop.name} 
                              className="crop-thumb" 
                            />
                            <div className="crop-details">
                              <span className="crop-name-label">{crop.name}</span>
                              <span className="crop-category-tag">{crop.category}</span>
                            </div>
                          </div>
                        </td>
                        <td className="text-right font-bold">{crop.quantity} {crop.unit}</td>
                        <td className="text-right text-muted">{crop.ordersCount} sales</td>
                        <td className="text-right font-bold" style={{ color: '#2d6a4f' }}>
                          ₹{crop.revenue.toLocaleString()}
                        </td>
                        <td className="text-right">
                          <div className="crop-share-progress-wrapper" style={{ justifyContent: 'flex-end' }}>
                            <div className="crop-share-progress-bar">
                              <div className="crop-share-progress-fill" style={{ width: `${share}%` }}></div>
                            </div>
                            <span className="font-bold">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#7c8d84' }}>
                <Package size={36} style={{ marginBottom: '0.75rem', opacity: 0.7 }} />
                <p>No active crop listings have recorded sales yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories breakdown share */}
        <div className="analytics-card-large">
          <div className="card-header-new">
            <h3>Crop Share Breakdown</h3>
            <span className="card-header-badge">Share %</span>
          </div>

          <div className="crop-progress-list">
            <div className="crop-progress-item">
              <div className="crop-progress-labels">
                <span>Grains</span>
                <span>{finalCategoryShares.grains}%</span>
              </div>
              <div className="crop-progress-bar-bg">
                <div className="crop-progress-bar-fill fill-grains" style={{ width: `${finalCategoryShares.grains}%` }}></div>
              </div>
            </div>

            <div className="crop-progress-item">
              <div className="crop-progress-labels">
                <span>Fruits & Vegetables</span>
                <span>{finalCategoryShares.fruits}%</span>
              </div>
              <div className="crop-progress-bar-bg">
                <div className="crop-progress-bar-fill fill-fruits" style={{ width: `${finalCategoryShares.fruits}%` }}></div>
              </div>
            </div>

            <div className="crop-progress-item">
              <div className="crop-progress-labels">
                <span>Dairy Products</span>
                <span>{finalCategoryShares.dairy}%</span>
              </div>
              <div className="crop-progress-bar-bg">
                <div className="crop-progress-bar-fill fill-dairy" style={{ width: `${finalCategoryShares.dairy}%` }}></div>
              </div>
            </div>

            <div className="crop-progress-item">
              <div className="crop-progress-labels">
                <span>Spices</span>
                <span>{finalCategoryShares.spices}%</span>
              </div>
              <div className="crop-progress-bar-bg">
                <div className="crop-progress-bar-fill fill-spices" style={{ width: `${finalCategoryShares.spices}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Monthly Financial Charts & Historical Statements */}
      <div className="analytics-main-grid">
       
        <div className="analytics-card-large">
          <div className="card-header-new">
            <h3>Monthly Revenue Trend</h3>
            <span className="card-header-badge">Monthly</span>
          </div>

          {sortedMonths.length > 1 ? (
            <div className="chart-wrapper" style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
                <svg 
                  ref={svgRef} 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 500 180" 
                  width="500" 
                  height="180"
                >
                  <defs>
                    <linearGradient id="fullAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#40916c" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#40916c" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(82, 183, 136, 0.1)" strokeDasharray="4" />
                  <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(82, 183, 136, 0.1)" strokeDasharray="4" />
                  <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(82, 183, 136, 0.1)" strokeDasharray="4" />
                  <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(82, 183, 136, 0.3)" />

                  {pathD && (
                    <>
                      <path d={pathD} fill="none" stroke="#40916c" strokeWidth="3.5" />
                      <path d={areaD} fill="url(#fullAreaGrad)" />
                    </>
                  )}

                  {points.map((pt, idx) => (
                    <g key={idx} className="chart-node-group">
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#1b4332" />
                      <text x={pt.x} y={pt.y - 10} fill="#1b4332" fontSize="9" textAnchor="middle" fontWeight="bold">
                        ₹{pt.revenue >= 1000 ? `${(pt.revenue / 1000).toFixed(1)}k` : pt.revenue}
                      </text>
                    </g>
                  ))}

                  {points.map((pt, idx) => (
                    <text key={idx} x={pt.x} y="170" fill="#7c8d84" fontSize="10" textAnchor="middle">
                      {pt.monthName}
                    </text>
                  ))}
                </svg>
              </div>

              {chartPngUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <img 
                    src={chartPngUrl} 
                    alt="Monthly Revenue Trend Chart" 
                    className="chart-png-image" 
                    style={{ 
                      width: '100%', 
                      height: 'auto', 
                      borderRadius: '12px', 
                      border: '1px solid rgba(82, 183, 136, 0.15)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }} 
                  />
                  <a 
                    href={chartPngUrl} 
                    download={`revenue_trend_${Date.now()}.png`}
                    className="download-chart-btn"
                    style={{
                      alignSelf: 'flex-end',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.8rem',
                      backgroundColor: 'rgba(82, 183, 136, 0.15)',
                      color: '#2d6a4f',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Download size={12} />
                    <span>Download Chart PNG</span>
                  </a>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#7c8d84' }}>
                  Loading monthly revenue trend chart...
                </div>
              )}
            </div>
          ) : sortedMonths.length === 1 ? (

            <div className="single-month-card">
              <Calendar size={32} style={{ color: '#40916c', marginBottom: '0.25rem' }} />
              <div className="single-month-desc" style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '1px' }}>
                Active Sales Month: {sortedMonths[0].key}
              </div>
              <h2 className="single-month-val">₹{sortedMonths[0].revenue.toLocaleString()}</h2>
              <p className="single-month-desc">
                {sortedMonths[0].ordersCount} order(s) successfully placed, dispatching a total volume of {sortedMonths[0].inventoryDispatched} Kg of crops.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#7c8d84' }}>
              No monthly sales records available.
            </div>
          )}
        </div>

        <div className="analytics-card-large">
          <div className="card-header-new">
            <h3>Monthly Statements</h3>
            <span className="card-header-badge">Performance</span>
          </div>

          <div className="crop-performance-table-wrapper">
            <table className="crop-performance-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="text-right">Orders</th>
                  <th className="text-right">Revenue</th>
                  <th className="text-right">Index</th>
                </tr>
              </thead>
              <tbody>
                {statements.map((pt, idx) => {
                  let statusClass = 'status-delivered';
                  let indexText = 'EXCELLENT';
                  let styleOverride = null;

                  if (pt.revenue > 30000) {
                    indexText = 'EXCELLENT';
                    statusClass = 'status-delivered';
                  } else if (pt.revenue > 10000) {
                    indexText = 'STABLE';
                    statusClass = 'status-shipped';
                  } else if (pt.revenue > 0) {
                    indexText = 'GROWING';
                    statusClass = 'status-pending';
                  } else {
                    indexText = 'NO ACTIVITY';
                    styleOverride = { backgroundColor: 'rgba(124, 141, 132, 0.15)', color: '#7c8d84' };
                  }

                  return (
                    <tr key={idx}>
                      <td><strong>{pt.key}</strong></td>
                      <td className="text-right">{pt.ordersCount} Orders</td>
                      <td className="text-right font-bold" style={{ color: '#2d6a4f' }}>
                        ₹{pt.revenue.toLocaleString()}
                      </td>
                      <td className="text-right">
                        <span 
                          className={`order-status-badge ${statusClass}`}
                          style={styleOverride}
                        >
                          {indexText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Interactive Details Modal */}
      {activeModal && (
        <div className="analytics-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="analytics-modal-content" onClick={e => e.stopPropagation()}>
            <div className="analytics-modal-header">
              <h3>{getModalTitle()}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => handleDownloadPDF(activeModal)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.4rem 0.8rem',
                    backgroundColor: 'rgba(82, 183, 136, 0.15)',
                    color: '#2d6a4f',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                  title="Directly download this statement as a non-editable PDF"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
                <button className="analytics-modal-close" onClick={() => setActiveModal(null)}>&times;</button>
              </div>
            </div>
            
            <div className="analytics-modal-body">
              {activeModal === 'revenue' && (
                <div className="crop-performance-table-wrapper">
                  <table className="crop-performance-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Product Details</th>
                        <th>Buyer Name</th>
                        <th className="text-right">Revenue</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validOrders.map((o, idx) => (
                        <tr key={idx}>
                          <td>{o.date}</td>
                          <td><strong>{o.id}</strong></td>
                          <td>{o.productName} (x{o.quantity})</td>
                          <td>{o.buyerName}</td>
                          <td className="text-right font-bold" style={{ color: '#2d6a4f' }}>
                            ₹{o.amount.toLocaleString()}
                          </td>
                          <td>
                            <span className={`order-status-badge status-${o.status === 'Out for Delivery' ? 'pending' : o.status}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {validOrders.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#7c8d84' }}>
                            No revenue records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeModal === 'sales' && (
                <div className="crop-performance-table-wrapper">
                  <table className="crop-performance-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Product Details</th>
                        <th>Buyer Name & Contact</th>
                        <th className="text-right">Quantity</th>
                        <th>Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {validOrders.map((o, idx) => (
                        <tr key={idx}>
                          <td><strong>{o.id}</strong></td>
                          <td>{o.date}</td>
                          <td>{o.productName}</td>
                          <td>{o.buyerName} ({o.buyerEmail})</td>
                          <td className="text-right font-bold">{o.quantity} {o.unit}</td>
                          <td>
                            <span className={`order-status-badge status-${o.status === 'Out for Delivery' ? 'pending' : o.status}`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {validOrders.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#7c8d84' }}>
                            No sales orders recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeModal === 'volume' && (
                <div className="crop-performance-table-wrapper">
                  <table className="crop-performance-table">
                    <thead>
                      <tr>
                        <th>Crop Name</th>
                        <th>Category</th>
                        <th className="text-right">Volume Dispatched</th>
                        <th className="text-right">Units Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cropSalesList.map((crop, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="crop-info-cell">
                              <img src={crop.image || 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=100'} alt={crop.name} className="crop-thumb" />
                              <span className="crop-name-label">{crop.name}</span>
                            </div>
                          </td>
                          <td style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: '#7c8d84' }}>
                            {crop.category}
                          </td>
                          <td className="text-right font-bold" style={{ color: '#2d6a4f' }}>
                            {crop.quantity.toLocaleString()} {crop.unit}
                          </td>
                          <td className="text-right text-muted">{crop.ordersCount} sales</td>
                        </tr>
                      ))}
                      {cropSalesList.length === 0 && (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#7c8d84' }}>
                            No crop volumes dispatched.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeModal === 'average' && (
                <div>
                  <div className="calculation-summary-box">
                    <span style={{ fontWeight: 700, color: '#1b4332', fontSize: '0.95rem', marginBottom: '0.25rem' }}>Average Order Value Formula:</span>
                    <div className="calculation-step">
                      <span>Total Revenue generated:</span>
                      <strong>₹{totalRevenue.toLocaleString()}</strong>
                    </div>
                    <div className="calculation-step">
                      <span>Successful Orders count:</span>
                      <strong>{totalOrdersCount} orders</strong>
                    </div>
                    <div className="calculation-step result">
                      <span>Average value per order:</span>
                      <span>₹{avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <h4 style={{ margin: '1.5rem 0 0.75rem 0', fontWeight: 700, color: '#1b4332' }}>Contributing Transactions list</h4>
                  
                  <div className="crop-performance-table-wrapper">
                    <table className="crop-performance-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Product Name</th>
                          <th>Date</th>
                          <th className="text-right">Transaction Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validOrders.map((o, idx) => (
                          <tr key={idx}>
                            <td><strong>{o.id}</strong></td>
                            <td>{o.productName}</td>
                            <td>{o.date}</td>
                            <td className="text-right font-bold" style={{ color: '#2d6a4f' }}>
                              ₹{o.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                        {validOrders.length === 0 && (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#7c8d84' }}>
                              No transactions to average.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
