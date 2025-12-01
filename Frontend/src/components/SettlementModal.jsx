import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function SettlementModal({ isOpen, onClose, group }) {
  const { addExpense, balances } = useStore();
  const [payer, setPayer] = useState('');
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');

  // Calculate debts to suggest settlements
  const debts = [];
  const members = group?.members || [];
  
  // Simple algorithm to find who owes whom (simplified for UI suggestions)
  // In a real app, this would be more complex graph simplification
  const memberBalances = { ...balances };
  
  // Filter balances for current group members only to avoid confusion if global balances exist
  // (Assuming balances in store are for current group)

  useEffect(() => {
    if (isOpen) {
      setPayer('');
      setReceiver('');
      setAmount('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payer || !receiver || !amount) return;

    await recordSettlement({
      group_id: group.group_id,
      payer: parseInt(payer),
      receiver: parseInt(receiver),
      amount: parseFloat(amount)
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all scale-100">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">
              🤝
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Settle Up</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Payer</label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={payer}
                  onChange={(e) => setPayer(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {group.members.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="text-gray-400 text-xl">→</div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Receiver</label>
                <select
                  className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {group.members.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="text-center block mb-2 text-gray-600">Amount to Settle</label>
            <div className="relative max-w-[200px] mx-auto">
              <span className="absolute left-4 top-3 text-gray-400 text-xl">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 text-3xl font-bold text-center text-gray-900 border-b-2 border-gray-200 focus:border-primary outline-none bg-transparent transition-colors placeholder-gray-300"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5"
            >
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
