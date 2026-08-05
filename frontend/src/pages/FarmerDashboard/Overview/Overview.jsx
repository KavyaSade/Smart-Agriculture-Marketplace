import React from 'react';
import { IndianRupee, Truck, Package } from 'lucide-react';
import './Overview.css';

const Overview = ({ stats, orders, products, handleTabChange, warningProducts }) => {
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
                    <td>{order.buyer}</td>
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

        <div className="analytics-card-redesign warnings-column">
          <div className="card-section-header-redesign">
            <h2>Inventory Warnings</h2>
            {warningProducts.length > 0 && (
              <span className="warnings-badge">{warningProducts.length} alert(s)</span>
            )}
          </div>
          <div className="warnings-list-redesign">
            {warningProducts.slice(0, 2).map((p, idx) => (
              <div key={`warning-${idx}`} className="warning-card-redesign">
                <div className="warning-left">
                  <div className="warning-thumb-placeholder">
                    {p.image ? (
                      <img src={p.image} alt={p.name} />
                    ) : (
                      <Package size={20} />
                    )}
                  </div>
                  <div className="warning-info">
                    <strong className="warning-name">{p.name}</strong>
                    <span className="warning-status">{p.statusText}</span>
                  </div>
                </div>
                <button onClick={() => handleTabChange('products')} className="restock-action-btn">
                  Restock
                </button>
              </div>
            ))}

            {warningProducts.length === 0 && (
              <div className="warning-card-redesign-empty">
                <span>No stock alerts active. All products are fully stocked!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
