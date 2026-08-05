import React, { useState } from 'react';
import './Revenue.css';

export default function Revenue({ revenueBalance, setRevenueBalance, transactions, setTransactions, setAlert }) {
  const [payoutInput, setPayoutInput] = useState('');

  // request money payout
  const handlePayoutSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(payoutInput);
    if (!amount || amount <= 0) {
      setAlert({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }
    if (amount > revenueBalance) {
      setAlert({ type: 'error', text: 'Insufficient balance.' });
      return;
    }

    setRevenueBalance(prev => prev - amount);
    const newTxn = {
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      type: 'withdrawal',
      desc: 'Transfer to Linked Bank Account',
      amount: -amount,
      date: new Date().toISOString().split('T')[0],
      status: 'completed'
    };
    setTransactions([newTxn, ...transactions]);
    setPayoutInput('');
    setAlert({ type: 'success', text: `Withdrawal of ₹${amount.toFixed(2)} completed!` });
  };

  return (
    <div className="revenue-view">
      <div className="revenue-details-container">
        
        <div className="revenue-main-balance">
          <div>
            <span className="balance-header">Available Balance</span>
            <h1 className="balance-amount">₹{revenueBalance.toFixed(2)}</h1>
            <p className="balance-info-note">
              This money is from your delivered orders. You can withdraw it to your bank account.
            </p>
          </div>

          <form onSubmit={handlePayoutSubmit} className="mt-6">
            <label className="text-xs font-bold block mb-1 opacity-90">Withdraw Funds</label>
            <div className="transfer-form-group">
              <input
                type="number"
                step="0.01"
                placeholder="enter amount to withdraw"
                className="form-input transfer-field text-slate-900"
                value={payoutInput}
                onChange={(e) => setPayoutInput(e.target.value)}
              />
              <button type="submit" className="payout-btn">
                Transfer Now
              </button>
            </div>
          </form>
        </div>

        <div className="dashboard-card">
          <h3 className="text-lg font-bold text-dark mb-4">Transaction History</h3>
          
          <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
            {transactions.map(txn => (
              <div key={txn.id} className="flex justify-between items-center p-3 border border-slate-100 dark:border-zinc-800 rounded-xl">
                <div>
                  <h4 className="text-sm font-bold text-dark">{txn.desc}</h4>
                  <span className="text-xs text-muted">{txn.date} • {txn.id}</span>
                </div>
                <span className={`font-bold ${txn.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {txn.amount > 0 ? '+' : ''}₹{txn.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
