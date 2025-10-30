import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';

export default function AddExpense() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentGroup, addExpense } = useStore();
  const [form, setForm] = useState({
    description: '',
    amount: '',
    paid_by: '',
    split_type: 'equal',
    split: {},
  });
  const [loading, setLoading] = useState(false);

  const members = currentGroup?.members || [];

  useEffect(() => {
    if (members.length > 0 && !form.paid_by) {
      // Set first member as default paid_by
      setForm(prev => ({ ...prev, paid_by: members[0].user_id }));
    }
  }, [members, form.paid_by]);

  const handleSplitChange = () => {
    const { amount, split_type } = form;
    const split = {};

    if (!amount) return;

    const totalAmount = parseFloat(amount);
    
    if (split_type === 'equal') {
      const perPerson = (totalAmount / members.length).toFixed(2);
      members.forEach((member) => {
        split[member.user_id] = parseFloat(perPerson);
      });
    } else if (split_type === 'unequal') {
      // Initialize with zeros for unequal split
      members.forEach((member) => {
        split[member.user_id] = 0;
      });
    }

    setForm(prev => ({ ...prev, split }));
  };

  const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    setForm(prev => ({ ...prev, amount: newAmount }));
    
    // Recalculate split
    if (newAmount && form.split_type === 'equal') {
      handleSplitChange();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // Validate total split equals amount for unequal split
      if (form.split_type === 'unequal') {
        const totalSplit = Object.values(form.split).reduce((sum, val) => sum + parseFloat(val || 0), 0);
        const totalAmount = parseFloat(form.amount);
        
        if (Math.abs(totalSplit - totalAmount) > 0.01) {
          alert('Total split amount must equal the expense amount');
          return;
        }
      }

      await addExpense({
        group_id: parseInt(id),
        description: form.description,
        amount: parseFloat(form.amount),
        paid_by: parseInt(form.paid_by),
        split: form.split,
      });

      navigate(`/groups/${id}`);
    } catch (error) {
      alert('Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h1 className="text-2xl font-bold mb-6">Add Expense to {currentGroup.name}</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Description */}
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  type="text"
                  placeholder="e.g., Dinner at Olive Garden, Taxi fare, etc."
                  className="form-control"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>

              {/* Amount */}
              <div className="form-group">
                <label htmlFor="amount">Amount ($)</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="form-control"
                  value={form.amount}
                  onChange={handleAmountChange}
                  required
                />
              </div>

              {/* Paid By */}
              <div className="form-group">
                <label htmlFor="paid_by">Paid by</label>
                <select
                  id="paid_by"
                  className="form-control"
                  value={form.paid_by}
                  onChange={(e) => setForm(prev => ({ ...prev, paid_by: e.target.value }))}
                  required
                >
                  <option value="">Select who paid</option>
                  {members.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Split Type */}
              <div className="form-group">
                <label htmlFor="split_type">Split Type</label>
                <select
                  id="split_type"
                  className="form-control"
                  value={form.split_type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setForm(prev => ({ 
                      ...prev, 
                      split_type: newType 
                    }));
                    handleSplitChange();
                  }}
                >
                  <option value="equal">Split Equally</option>
                  <option value="unequal">Split Unequally</option>
                  <option value="percentage">Split by Percentage</option>
                </select>
              </div>

              {/* Split Details */}
              {form.split_type === 'equal' && form.amount && (
                <div className="card p-4 bg-green-50">
                  <h4 className="font-semibold mb-2">Equal Split</h4>
                  <p className="text-green-700">
                    Each of the {members.length} members will pay ${((parseFloat(form.amount) / members.length).toFixed(2))}
                  </p>
                </div>
              )}

              {form.split_type === 'unequal' && (
                <div className="card p-4">
                  <h4 className="font-semibold mb-4">Split Unequally</h4>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div key={member.user_id} className="flex justify-between items-center">
                        <span className="font-medium">{member.name}</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="w-24 p-2 border border-gray-300 rounded-lg text-right"
                          value={form.split[member.user_id]?.toString() || ''}
                          onChange={(e) => {
                            const newSplit = { ...form.split };
                            newSplit[member.user_id] = parseFloat(e.target.value) || 0;
                            setForm(prev => ({ ...prev, split: newSplit }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {form.amount && (
                    <p className="mt-3 text-sm text-gray-600">
                      Total split: ${Object.values(form.split).reduce((sum, val) => sum + (parseFloat(val) || 0), 0).toFixed(2)} / ${form.amount}
                    </p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !form.description || !form.amount || !form.paid_by}
                className="btn btn-primary w-full"
              >
                {loading ? 'Adding...' : 'Add Expense'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}