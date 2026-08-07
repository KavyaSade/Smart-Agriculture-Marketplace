import React, { useState } from 'react';
import './Orders.css';

const Orders = ({
  orders,
  handleCancelOrder,
  onRefreshOrders
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const selectedOrder = orders.find(o => o._id === selectedOrderId || o.id === selectedOrderId);

  const handleDownloadReceipt = (order) => {
    const receiptWindow = window.open('', '_blank');

    // Estimate breakdown of values for printable tax invoice
    const gst = Math.round(order.amount * 0.05);
    const platformFee = 30;
    const shippingFee = 120;
    const subtotal = order.amount - gst - platformFee - shippingFee;

    const htmlContent = `
      <html>
      <head>
        <title>Invoice - ${order.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #334155; }
          .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 30px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: 800; color: #065f46; letter-spacing: -0.5px; }
          .logo span { color: #10b981; }
          .title { font-size: 15px; color: #64748b; text-align: right; line-height: 1.5; }
          .details { display: flex; justify-content: space-between; margin-bottom: 30px; line-height: 1.6; font-size: 14px; }
          .col { flex: 1; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
          th, td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: left; }
          th { background-color: #f0fdf4; color: #065f46; font-weight: 700; }
          .totals { text-align: right; line-height: 1.8; font-size: 14px; color: #64748b; }
          .totals span { font-weight: 800; color: #0f172a; font-size: 18px; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          .btn-print { background-color: #10b981; color: white; padding: 10px 24px; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold; transition: background-color 0.2s; }
          .btn-print:hover { background-color: #059669; }
          @media print { .btn-print { display: none; } .invoice-card { border: none; box-shadow: none; padding: 0; } }
        </style>
      </head>
      <body>
        <div style="text-align: right; max-width: 800px; margin: 0 auto 20px auto;">
          <button class="btn-print" onclick="window.print()">Print Tax Invoice</button>
        </div>
        <div class="invoice-card">
          <div class="header">
            <div>
              <div class="logo">Agri<span>Market</span></div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Direct Farm-to-Consumer Marketplace</div>
            </div>
            <div class="title">
              <strong style="font-size: 20px; color: #0f172a;">TAX INVOICE</strong><br>
              Order ID: <strong>${order.id}</strong><br>
              Tracking ID: <strong>${order.trackingNumber || 'AGRI-TRK-PENDING'}</strong><br>
              Date Issued: ${order.date}
            </div>
          </div>
          <div class="details">
            <div class="col">
              <strong style="color: #0f172a; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Billed To:</strong><br>
              <span style="font-weight: 600; font-size: 15px; color: #0f172a; display: block; margin: 4px 0;">${order.buyerName}</span>
              Phone: ${order.buyerPhone || 'N/A'}<br>
              Address: ${order.buyerAddress || 'N/A'}
            </div>
            <div class="col" style="text-align: right;">
              <strong style="color: #0f172a; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Farmer Details:</strong><br>
              <span style="font-weight: 600; font-size: 15px; color: #0f172a; display: block; margin: 4px 0;">${order.farmerName}</span>
              Email: ${order.farmerEmail || 'N/A'}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Crop Description</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 600; color: #0f172a;">${order.productName} <span style="font-size: 11px; font-weight: normal; color: #64748b; display: block; margin-top: 2px;">Fresh farm harvest</span></td>
                <td style="text-align: right;">₹${(order.amount / order.quantity).toFixed(2)} / ${order.unit}</td>
                <td style="text-align: center;">${order.quantity} ${order.unit}</td>
                <td style="text-align: right; font-weight: 600; color: #0f172a;">₹${order.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="totals">
            Subtotal: ₹${(subtotal > 0 ? subtotal : 0).toLocaleString()}<br>
            GST (5%): ₹${gst.toLocaleString()}<br>
            Delivery Fee: ₹${shippingFee.toLocaleString()}<br>
            Platform Commission: ₹${platformFee.toLocaleString()}<br>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 10px 0; display: inline-block; width: 250px;"><br>
            <span style="font-size: 15px;">Invoice Total:</span> <span>₹${order.amount.toLocaleString()}</span>
          </div>
          <div class="footer">
            Thank you for supporting local farmers and organic agriculture.<br>
            This is a system generated invoice and does not require a physical signature.
          </div>
        </div>
      </body>
      </html>
    `;
    receiptWindow.document.write(htmlContent);
    receiptWindow.document.close();
  };

  return (
    <div className="section-card animate-fade-in">
      <div className="card-section-header">
        <h2>Your Placed Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state" style={{ padding: '3rem 1rem' }}>
          <span className="empty-state-text">You have no order transactions yet.</span>
        </div>
      ) : (
        <div className="orders-table-wrapper" style={{ marginTop: '1.5rem' }}>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Crop Description</th>
                <th>Farmer Details</th>
                <th>Total Value</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td><span className="order-id">{order.id}</span></td>
                  <td>
                    <div className="order-items-col">
                      <span className="order-item-title">{order.productName}</span>
                      <span className="order-item-qty">Quantity: {order.quantity} {order.unit}</span>
                    </div>
                  </td>
                  <td>
                    <span className="order-farmer-name">{order.farmerName}</span>
                  </td>
                  <td><span className="order-amount-val">₹{order.amount.toLocaleString()}</span></td>
                  <td>{order.date}</td>
                  <td>
                    <span className={`order-status-badge status-${order.status}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={async () => {
                          if (onRefreshOrders) {
                            await onRefreshOrders();
                          }
                          setSelectedOrderId(order._id || order.id);
                        }}
                        className="btn-order-action"
                        style={{
                          backgroundColor: 'rgba(82, 183, 136, 0.08)',
                          color: '#40916c',
                          border: '1px solid rgba(82, 183, 136, 0.2)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <img src="/src/assets/icons/marker.png" alt="" style={{ width: '12px', height: '12px' }} />
                        <span>Track</span>
                      </button>

                      {order.status === 'pending' ? (
                        <button
                          // Use database document id for API calls.
                          onClick={() => handleCancelOrder(order._id)}
                          className="btn-order-action"
                          style={{
                            backgroundColor: 'rgba(220, 38, 38, 0.08)',
                            color: '#dc2626',
                            border: '1px solid rgba(220, 38, 38, 0.2)',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Visual tracking modal*/}
      {selectedOrder && (
        <div className="tracking-modal-overlay">
          <div className="tracking-modal-card animate-fade-in">

           
            <div className="tracking-modal-header">
              <div>
                <h3>Order Progress Tracking</h3>
                <span className="tracking-subtext">Order Reference: <strong>{selectedOrder.id}</strong></span>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="tracking-close-btn"
              >
                <img src="/src/assets/icons/multiply.png" alt="Close" style={{ width: '16px', height: '16px', filter: 'brightness(0.6)' }} />
              </button>
            </div>

            <div className="tracking-modal-content">

              <div className="tracking-info-strip">
                <div>
                  <span className="info-label">Tracking Number</span>
                  <span className="info-value">{selectedOrder.trackingNumber || 'AGRI-TRK-PENDING'}</span>
                </div>
                <div>
                  <span className="info-label">Est. Delivery</span>
                  <span className="info-value">
                    {selectedOrder.productName.toLowerCase().includes('rice') ||
                      selectedOrder.productName.toLowerCase().includes('wheat') ||
                      selectedOrder.productName.toLowerCase().includes('grain')
                      ? '2-3 Days (Grains)'
                      : 'Next Day (Fresh Crops)'}
                  </span>
                </div>
                <div>
                  <span className="info-label">Carrier Partner</span>
                  <span className="info-value">AgriLogistics India</span>
                </div>
              </div>

              {selectedOrder.status === 'cancelled' ? (
                <div className="cancelled-alert-card">
                  <img src="/src/assets/icons/delete.png" alt="Alert" className="alert-icon" style={{ width: '32px', height: '32px', display: 'block', margin: '0 auto 1rem' }} />
                  <h4>This Order Was Cancelled</h4>
                  <p>This transaction has been voided. Any stock reservations have been returned to the farmer's inventory listing.</p>
                </div>
              ) : (
                <div className="tracking-timeline">

                  {/* Step 1: Placed */}
                  <div className="timeline-step active">
                    <div className="step-marker">
                      <img src="/src/assets/icons/shopping-bag.png" alt="" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />
                    </div>
                    <div className="step-details">
                      <div className="step-header">
                        <h4>Order Placed & Confirmed</h4>
                        <span className="step-time">Day 1</span>
                      </div>
                      <p>We received your direct farm request successfully.</p>
                    </div>
                  </div>

                  {/* Step 2: Shipped */}
                  <div className={`timeline-step ${['shipped', 'Out for Delivery', 'delivered'].includes(selectedOrder.status) ? 'active' : ''}`}>
                    <div className="step-marker">
                      <img src="/src/assets/icons/delivery.png" alt="" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />
                    </div>
                    <div className="step-details">
                      <div className="step-header">
                        <h4>Dispatched from Farm</h4>
                        <span className="step-time">{['shipped', 'Out for Delivery', 'delivered'].includes(selectedOrder.status) ? 'Shipped' : 'Pending'}</span>
                      </div>
                      <p>Farmer <strong>{selectedOrder.farmerName}</strong> has processed and dispatched the crop shipment.</p>
                    </div>
                  </div>

                  {/* Step 3: Out for Delivery */}
                  <div className={`timeline-step ${['Out for Delivery', 'delivered'].includes(selectedOrder.status) ? 'active' : ''}`}>
                    <div className="step-marker">
                      <img src="/src/assets/icons/marker.png" alt="" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />
                    </div>
                    <div className="step-details">
                      <div className="step-header">
                        <h4>Out for Delivery</h4>
                        <span className="step-time">{['Out for Delivery', 'delivered'].includes(selectedOrder.status) ? 'Active' : 'Pending'}</span>
                      </div>
                      <p>Crops reached your local hub. The courier partner is out for physical delivery.</p>
                    </div>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className={`timeline-step ${selectedOrder.status === 'delivered' ? 'active final' : ''}`}>
                    <div className="step-marker">
                      <img src="/src/assets/icons/handshake.png" alt="" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />
                    </div>
                    <div className="step-details">
                      <div className="step-header">
                        <h4>Crops Delivered Successfully</h4>
                        <span className="step-time">{selectedOrder.status === 'delivered' ? 'Completed' : 'Pending'}</span>
                      </div>
                      <p>Crops received safely! Enjoy fresh organic produce directly from Indian farms.</p>
                    </div>
                  </div>

                </div>
              )}

              {/* Order Invoice Details */}
              <div className="tracking-summary-card">
                <h4>Invoice Details</h4>
                <div className="crop-summary-row">
                  <div>
                    <strong>{selectedOrder.productName}</strong>
                    <span className="crop-qty-desc">Quantity: {selectedOrder.quantity} {selectedOrder.unit}</span>
                  </div>
                  <strong className="crop-price">₹{selectedOrder.amount.toLocaleString()}</strong>
                </div>

                <div className="receipt-action-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', borderTop: '1px solid rgba(82, 183, 136, 0.08)', paddingTop: '1rem' }}>
                  <div className="payment-note" style={{ fontSize: '0.75rem', color: '#7c8d84' }}>
                    * Direct escrow transaction protected by AgriMarket.
                  </div>
                  <button
                    onClick={() => handleDownloadReceipt(selectedOrder)}
                    className="btn btn-secondary btn-receipt-download"
                    style={{
                      border: '1px solid rgba(82, 183, 136, 0.3)',
                      color: '#40916c',
                      padding: '0.45rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backgroundColor: 'transparent'
                    }}
                  >
                    <img src="/src/assets/icons/rupee.png" alt="" style={{ width: '12px', height: '12px' }} />
                    <span>View Tax Invoice</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
