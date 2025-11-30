import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button, Badge } from '../components/ui';
import Analytics from '../components/Analytics';
import SettlementModal from '../components/SettlementModal';
import {
  Plus,
  Settings,
  Trash2,
  Receipt,
  BarChart3,
  Wallet,
  ArrowRightLeft
} from 'lucide-react';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentGroup, expenses, balances, fetchGroup, deleteExpense, loading } = useStore();
  const [activeTab, setActiveTab] = useState('expenses');
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);

  useEffect(() => {
    fetchGroup(id);
    const interval = setInterval(() => {
      fetchGroup(id);
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading || !currentGroup) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  const totalSpent = expenses
    .filter(e => !e.is_settlement)
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div className="space-y-6">
      {/* Group Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{currentGroup.name}</h1>
          <p className="text-gray-500">{currentGroup.description || 'No description'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(`/groups/${id}/manage`)}>
            <Settings size={18} className="mr-2" />
            Manage
          </Button>
          <Button onClick={() => navigate(`/groups/${id}/add-expense`)}>
            <Plus size={18} className="mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none">
          <p className="text-indigo-100 font-medium mb-1">Total Expenses</p>
          <h3 className="text-3xl font-bold">${totalSpent.toFixed(2)}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500 font-medium mb-1">Members</p>
          <h3 className="text-3xl font-bold text-gray-900">{currentGroup.members.length}</h3>
        </Card>
        <Card className="p-6">
          <p className="text-gray-500 font-medium mb-1">Your Balance</p>
          <h3 className={`text-3xl font-bold ${balances[useStore.getState().user?.user_id] >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balances[useStore.getState().user?.user_id] >= 0 ? '+' : ''}
            ${(balances[useStore.getState().user?.user_id] || 0).toFixed(2)}
          </h3>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {[
            { id: 'expenses', label: 'Expenses', icon: Receipt },
            { id: 'balances', label: 'Balances', icon: Wallet },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 px-2 font-medium transition-colors relative ${activeTab === tab.id
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No expenses yet. Add one to get started!
              </div>
            ) : (
              expenses.map(expense => (
                <Card key={expense.expense_id} className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${expense.is_settlement ? 'bg-green-50 text-green-600' : 'bg-gray-50'
                      }`}>
                      {expense.is_settlement ? '🤝' : '🧾'}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{expense.description}</h4>
                      <p className="text-sm text-gray-500">
                        {expense.is_settlement ? 'Settlement' : `Paid by ${expense.paid_by_name}`} • {new Date(expense.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">${parseFloat(expense.amount).toFixed(2)}</p>
                      {!expense.is_settlement && (
                        <p className="text-xs text-gray-400">
                          Split between {expense.splits?.length || 0} people
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteExpense(expense.expense_id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'balances' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Net Balances</h3>
              <Button onClick={() => setIsSettlementModalOpen(true)} className="gap-2">
                <ArrowRightLeft size={18} />
                Settle Up
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentGroup.members.map(member => {
                const balance = balances[member.user_id] || 0;
                return (
                  <Card key={member.user_id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{member.name}</span>
                    </div>
                    <Badge variant={balance > 0 ? 'success' : balance < 0 ? 'danger' : 'default'}>
                      {balance > 0 ? 'gets back' : balance < 0 ? 'owes' : 'settled'} ${Math.abs(balance).toFixed(2)}
                    </Badge>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <Analytics expenses={expenses} members={currentGroup.members} />
        )}
      </div>

      <SettlementModal
        isOpen={isSettlementModalOpen}
        onClose={() => setIsSettlementModalOpen(false)}
        group={currentGroup}
      />
    </div>
  );
}