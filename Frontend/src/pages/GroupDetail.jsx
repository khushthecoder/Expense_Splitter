import { useParams, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export default function GroupDetail() {
  const { id } = useParams();
  const { currentGroup, expenses, fetchGroup, balances } = useStore();
  const userId = useStore((state) => state.user?.id);

  useEffect(() => {
    if (id) {
      fetchGroup(id);
    }
  }, [id, fetchGroup]);

  if (!currentGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const userBalance = balances[userId] || 0;
  const totalOwed = userBalance > 0 ? userBalance : 0;
  const totalOwe = userBalance < 0 ? Math.abs(userBalance) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container">
        {/* Group Header */}
        <div className="card mb-6">
          <h1 className="text-2xl font-bold mb-2">{currentGroup.name}</h1>
          <p className="text-gray-600">{currentGroup.description}</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="card balance-card balance-owed">
            <h3>You are owed</h3>
            <p className="amount">${totalOwed.toFixed(2)}</p>
          </div>
          <div className="card balance-card balance-owe">
            <h3>You owe</h3>
            <p className="amount">${totalOwe.toFixed(2)}</p>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Expenses</h2>
          <Link
            to={`/groups/${id}/add-expense`}
            className="btn btn-secondary"
          >
            + Add Expense
          </Link>
        </div>

        <div className="space-y-3 mb-8">
          {expenses.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No expenses yet. Add your first expense!
            </p>
          ) : (
            expenses.map((expense) => (
              <div key={expense.expense_id} className="expense-item">
                <div>
                  <h4>{expense.description}</h4>
                  <p className="text-gray-500">
                    Paid by <strong>{expense.paid_by_name}</strong> •{' '}
                    {new Date(expense.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="expense-amount">${expense.amount}</p>
                  <p className="text-gray-500 text-sm">
                    Split: {Object.keys(expense.split || {}).length} ways
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Settlement Section */}
        {(totalOwe > 0 || totalOwed > 0) && (
          <div className="settlement-card">
            <h3>Ready to Settle Up?</h3>
            <p className="text-gray-700 mb-4">
              Total to settle: <strong>${(totalOwe + totalOwed).toFixed(2)}</strong>
            </p>
            <button className="btn btn-danger">
              💳 Pay via Stripe / PayPal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}