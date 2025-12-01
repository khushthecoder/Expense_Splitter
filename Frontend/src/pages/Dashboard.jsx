import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button } from '../components/ui';
import { Plus, TrendingUp, TrendingDown, Clock, Users, DollarSign, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Dashboard() {
  const { user, groups, fetchGroups, loading } = useStore();
  const navigate = useNavigate();
  const [activity, setActivity] = useState([]);
  const [balances, setBalances] = useState({ youOwe: 0, youAreOwed: 0 });
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGroups();
      fetchActivity();
      calculateBalances();
    }
  }, [user]);

  const fetchActivity = async () => {
    try {
      setLoadingActivity(true);
      const res = await axios.get(`${API_URL}/users/${user.user_id}/activity`);
      setActivity(res.data.slice(0, 10)); // Show latest 10 activities
    } catch (err) {
      console.error('Failed to fetch activity', err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const calculateBalances = async () => {
    try {
      // Fetch all expenses where user is involved
      const groupExpensesPromises = groups.map(g =>
        axios.get(`${API_URL}/groups/${g.group_id}/expenses`)
      );

      const allExpenses = (await Promise.all(groupExpensesPromises))
        .flatMap(res => res.data);

      let totalOwed = 0;
      let totalOwing = 0;

      allExpenses.forEach(expense => {
        const userSplit = expense.splits?.find(s => s.user_id === user.user_id);
        if (!userSplit) return;

        const splitAmount = parseFloat(userSplit.share);

        if (expense.paid_by === user.user_id) {
          // User paid, others owe them
          totalOwed += parseFloat(expense.amount) - splitAmount;
        } else {
          // Someone else paid, user owes them
          totalOwing += splitAmount;
        }
      });

      setBalances({ youOwe: totalOwing, youAreOwed: totalOwed });
    } catch (err) {
      console.error('Failed to calculate balances', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.name}!</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              if (groups.length === 0) {
                alert("Please create a group first.");
              } else if (groups.length === 1) {
                navigate(`/groups/${groups[0].group_id}/add-expense`);
              } else {
                alert("Please select a group from the list below to add an expense.");
                // Optionally scroll to groups section
                document.getElementById('groups-section')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="gap-2"
            variant="secondary"
          >
            <Plus size={20} />
            Quick Add Expense
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-to-br from-red-50 to-orange-50 border-red-100 dark:from-red-900/20 dark:to-orange-900/20 dark:border-red-900/30">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <span className="text-sm font-medium text-red-600 bg-red-100 px-3 py-1 rounded-full">
              You Owe
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(balances.youOwe)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total amount you owe to others</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-900/30">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
              You Are Owed
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {formatCurrency(balances.youAreOwed)}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Total amount others owe you</p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock size={20} />
                Recent Activity
              </h2>
            </div>

            {loadingActivity ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : activity.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.flow === 'out' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                      <DollarSign size={20} className={
                        item.flow === 'out' ? 'text-red-600' : 'text-green-600'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.group} • {item.details}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${item.flow === 'out' ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {item.flow === 'out' ? '-' : '+'}{formatCurrency(item.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Group Summaries */}
        <div>
          <Card className="p-6" id="groups-section">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={20} />
                Your Groups
              </h2>
              <button
                onClick={() => navigate('/groups')}
                className="text-sm text-primary hover:text-primary-hover font-medium"
              >
                View All
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="mb-4">No groups yet</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/groups')}
                >
                  Create Group
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.slice(0, 5).map(group => (
                  <div
                    key={group.group_id}
                    onClick={() => navigate(`/groups/${group.group_id}`)}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-primary font-bold">
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{group.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {group.members?.length || 0} members
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}