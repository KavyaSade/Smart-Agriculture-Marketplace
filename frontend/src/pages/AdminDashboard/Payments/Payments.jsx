import React, { useState } from 'react';
import './Payments.css';

export default function Payments({ platformEarnings, payoutRequests, setPayoutRequests, setPlatformEarnings, setAlert }) {
  const processPayout = (requestId, amount, sellerName) => {
    setPayoutRequests(payoutRequests.map(r => 
      r.id === requestId ? { ...r, status: 'completed' } : r
    ));
    setAlert({ 
      type: 'success', 
      text: `Released payout of ₹${amount.toFixed(2)} to Retailer ${sellerName}!` 
    });
  };

  return (
    <div className="admin-payments-view">
      <div className="admin-payments-split">
        <div className="platform-wallet-card">
          <span className="balance-header">Total Commission Income</span>
          <h1 className="balance-amount">₹{platformEarnings.toFixed(2)}</h1>
          <p className="balance-info-note">
            Accumulated commissions earned from all platform orders based on active retailer commission rates.
          </p>
        </div>

        <div className="dashboard-card">
          <h3 className="text-dark font-bold mb-4">Retailer Payout Requests</h3>
          <div className="payout-requests-container flex flex-col gap-3">
            {payoutRequests.length > 0 ? (
              payoutRequests.map(req => (
                <div key={req.id} className="payout-request-item flex justify-between items-center p-3 border border-slate-100 dark:border-zinc-800 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-dark">{req.sellerName}</h4>
                    <span className="text-xs text-muted">{req.date} • {req.id}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-dark">₹{req.amount.toFixed(2)}</span>
                    {req.status === 'pending' ? (
                      <button
                        className="action-btn-small success"
                        onClick={() => processPayout(req.id, req.amount, req.sellerName)}
                      >
                        Approve Payout
                      </button>
                    ) : (
                      <span className="status-pill instock">Completed</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted text-sm">
                No active payout requests pending.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
