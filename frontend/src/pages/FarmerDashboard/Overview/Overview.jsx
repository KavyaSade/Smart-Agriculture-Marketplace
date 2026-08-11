import React from 'react';
import { IndianRupee, Truck, Package } from 'lucide-react';
import './Overview.css';

const Overview = ({ stats, orders = [], products = [], handleTabChange, warningProducts = [] }) => {
  // 1. Filtering out cancelled orders for summary calculations
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const totalVolume = validOrders.reduce((sum, o) => sum + Number(o.quantity || 0), 0);
  const totalOrdersCount = validOrders.length;
  const avgOrderValue = totalOrdersCount > 0 ? (totalRevenue / totalOrdersCount) : 0;

  // 2. Identifying top revenue generating crop
  const cropSalesMap = {};
  validOrders.forEach(o => {
    const key = o.productName;
    cropSalesMap[key] = (cropSalesMap[key] || 0) + Number(o.amount || 0);
  });
  let topCropName = "";
  let maxRevenue = -1;
  Object.keys(cropSalesMap).forEach(cropName => {
    if (cropSalesMap[cropName] > maxRevenue) {
      maxRevenue = cropSalesMap[cropName];
      topCropName = cropName;
    }
  });

  // 3. Computing delivery fulfillment ratio
  const fulfillmentRatio = orders.length > 0 ? Math.round((validOrders.length / orders.length) * 100) : 100;

  // 4. Calculating stock percentage remaining relative to a low stock warning threshold of 500
  const getStockPercentage = (p) => {
    if (!p.inStock || p.stock === 0) return 0;
    return Math.min(100, Math.round((p.stock / 500) * 100));
  };

  return (
    <>
      <section className="summary-cards-redesign">
        <div className="summary-card-new">
          <div className="card-icon-wrapper-new icon-sales">
            <IndianRupee size={22} />
          </div>
          <div className="card-details-new">
            <span className="card-value-new">₹{stats.totalEarnings.toLocaleString()}</span>
            <span className="card-title-new">Total Sales</span>
          </div>
        </div>

        <div className="summary-card-new">
          <div className="card-icon-wrapper-new icon-orders">
            <Truck size={22} />
          </div>
          <div className="card-details-new">
            <span className="card-value-new">{orders.length}</span>
            <span className="card-title-new">Total Orders</span>
          </div>
        </div>

        <div className="summary-card-new">
          <div className="card-icon-wrapper-new icon-products">
            <Package size={22} />
          </div>
          <div className="card-details-new">
            <span className="card-value-new">{products.length}</span>
            <span className="card-title-new">Total Products</span>
          </div>
        </div>

        <div className="summary-card-new">
          <div className="card-icon-wrapper-new icon-payout">
            <IndianRupee size={22} />
          </div>
          <div className="card-details-new">
            <span className="card-value-new">₹{(stats.totalEarnings * 0.9).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            <span className="card-title-new">Payout Balance</span>
          </div>
        </div>
      </section>

      <div className="dashboard-grid-redesign">
        <div className="analytics-card-redesign orders-column">
          <div className="card-section-header-redesign">
            <h2>Recent Orders</h2>
            <button onClick={() => handleTabChange('orders')} className="view-all-link">
              View All Orders
            </button>
          </div>
          <div className="orders-table-wrapper-redesign">
            <table className="orders-table-redesign">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Buyer</th>
                  <th>Product</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.id}</strong></td>
                    <td>{order.buyerName}</td>
                    <td>{order.productName} (x{order.quantity})</td>
                    <td><span className="order-amount-val">₹{order.amount.toLocaleString()}</span></td>
                    <td>
                      <span className={`order-status-pill badge-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="analytics-card-redesign warnings-column">
            <div className="card-section-header-redesign">
              <h2>Inventory Warnings</h2>
              <div style={{ display: 'flex', alignHTML: 'center', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-dot"></span>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live Monitor</span>
              </div>
            </div>
            <div className="warnings-list-redesign">
              {warningProducts.slice(0, 2).map((p, idx) => {
                const percent = getStockPercentage(p);
                const isOutOfStock = !p.inStock || p.stock === 0;

                return (
                  <div key={`warning-${idx}`} className="warning-card-redesign" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch', backgroundColor: isOutOfStock ? 'rgba(239, 68, 68, 0.05)' : 'rgba(245, 158, 11, 0.05)', borderColor: isOutOfStock ? '#fee2e2' : '#fef3c7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="warning-left">
                        <div className="warning-thumb-placeholder" style={{ backgroundColor: isOutOfStock ? '#fee2e2' : '#fef3c7', borderColor: isOutOfStock ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' }}>
                          {p.image ? (
                            <img src={p.image} alt={p.name} />
                          ) : (
                            <Package size={20} />
                          )}
                        </div>
                        <div className="warning-info">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <strong className="warning-name" style={{ color: isOutOfStock ? '#991b1b' : '#92400e' }}>{p.name}</strong>
                            <span className="status-label-badge" style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase', backgroundColor: isOutOfStock ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)', color: isOutOfStock ? '#991b1b' : '#92400e' }}>
                              {isOutOfStock ? 'Critical' : 'Low Stock'}
                            </span>
                          </div>
                          <span className="warning-status" style={{ color: isOutOfStock ? '#ef4444' : '#d97706' }}>{p.statusText}</span>
                        </div>
                      </div>
                      <button onClick={() => handleTabChange('products')} className="restock-action-btn" style={{ color: isOutOfStock ? '#991b1b' : '#92400e' }}>
                        Restock
                      </button>
                    </div>
                    
                    <div className="stock-progress-bar-bg" style={{ width: '100%', height: '5px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div className="stock-progress-bar-fill" style={{ width: `${percent}%`, height: '100%', backgroundColor: isOutOfStock ? '#ef4444' : '#f59e0b', borderRadius: '9999px', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>
                );
              })}

              {warningProducts.length === 0 && (
                <div className="warning-card-redesign-empty">
                  <span>No stock alerts active. All products are fully stocked!</span>
                </div>
              )}
            </div>
          </div>

          {/* Brief Analytics Summary Card */}
          <div className="analytics-card-redesign summary-analytics-column">
            <div className="card-section-header-redesign">
              <h2>Analytics Summary</h2>
              <button onClick={() => handleTabChange('analytics')} className="view-all-link">
                View Reports
              </button>
            </div>
            <div className="analytics-brief-summary" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="brief-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82, 183, 136, 0.08)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Avg Order Value</span>
                <strong className="brief-val" style={{ fontSize: '0.9rem', color: '#1b4332' }}>₹{avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
              </div>

              <div className="brief-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82, 183, 136, 0.08)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Volume Sold</span>
                <strong className="brief-val" style={{ fontSize: '0.9rem', color: '#1b4332' }}>{totalVolume.toLocaleString()} Kg</strong>
              </div>

              <div className="brief-item" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(82, 183, 136, 0.08)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Top Selling Crop</span>
                <strong className="brief-val" style={{ fontSize: '0.9rem', color: '#1b4332' }}>{topCropName || 'N/A'}</strong>
              </div>

              <div className="brief-item" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Fulfillment Ratio</span>
                <strong className="brief-val" style={{ fontSize: '0.9rem', color: '#1b4332' }}>{fulfillmentRatio}%</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
