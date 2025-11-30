import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card, Button, Input } from '../components/ui';
import { ArrowLeft, DollarSign, Users } from 'lucide-react';
import { friendService } from '../services/api';

export default function AddExpense() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const friendId = searchParams.get('friend_id');
  const navigate = useNavigate();
  const { currentGroup, fetchGroup, addExpense, loading, user } = useStore();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [splits, setSplits] = useState({});
  const [shares, setShares] = useState({});
  const [percentages, setPercentages] = useState({});
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        if (!currentGroup || currentGroup.group_id !== parseInt(id)) {
          await fetchGroup(id);
        }
      } else if (friendId) {
        // Load friend details
        try {
          const res = await friendService.getAll(user.user_id);
          const friend = res.data.find(f =>
            (f.user_id === user.user_id && f.friend_id === parseInt(friendId)) ||
            (f.friend_id === user.user_id && f.user_id === parseInt(friendId))
          );

          if (friend) {
            const friendUser = friend.user_id === user.user_id ? friend.friend : friend.user;
            setMembers([
              { user_id: user.user_id, name: 'You' },
              { user_id: friendUser.user_id, name: friendUser.name }
            ]);
          }
        } catch (err) {
          console.error("Failed to load friend", err);
        }
      }
    };
    loadData();
  }, [id, friendId, user]);

  useEffect(() => {
    if (currentGroup && id) {
      setMembers(currentGroup.members);
    }
  }, [currentGroup, id]);

  useEffect(() => {
    if (members.length > 0 && !paidBy) {
      setPaidBy(user.user_id);

      // Initialize splits
      const initialSplits = {};
      const initialShares = {};
      const initialPercentages = {};

      members.forEach(member => {
        initialSplits[member.user_id] = 0;
        initialShares[member.user_id] = 1;
        initialPercentages[member.user_id] = (100 / members.length).toFixed(2);
      });

      setSplits(initialSplits);
      setShares(initialShares);
      setPercentages(initialPercentages);
    }
  }, [members, paidBy, user]);

  const handleAmountChange = (val) => {
    setAmount(val);
    if (splitType === 'equal' && val && members.length > 0) {
      const splitAmount = parseFloat(val) / members.length;
      const newSplits = {};
      members.forEach(m => {
        newSplits[m.user_id] = splitAmount;
      });
      setSplits(newSplits);
    }
  };

  const handleSplitChange = (userId, value, type) => {
    if (type === 'amount') {
      setSplits(prev => ({ ...prev, [userId]: parseFloat(value) || 0 }));
    } else if (type === 'share') {
      const newShares = { ...shares, [userId]: parseFloat(value) || 0 };
      setShares(newShares);

      // Recalculate splits based on shares
      const totalShares = Object.values(newShares).reduce((a, b) => a + b, 0);
      const totalAmount = parseFloat(amount) || 0;
      const newSplits = {};

      Object.entries(newShares).forEach(([uid, share]) => {
        newSplits[uid] = (share / totalShares) * totalAmount;
      });
      setSplits(newSplits);
    } else if (type === 'percentage') {
      const newPercentages = { ...percentages, [userId]: parseFloat(value) || 0 };
      setPercentages(newPercentages);

      const totalAmount = parseFloat(amount) || 0;
      const newSplits = {};

      Object.entries(newPercentages).forEach(([uid, pct]) => {
        newSplits[uid] = (pct / 100) * totalAmount;
      });
      setSplits(newSplits);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !paidBy) return;

    try {
      await addExpense({
        group_id: id ? parseInt(id) : null,
        description,
        amount: parseFloat(amount),
        paid_by: parseInt(paidBy),
        split: splits
      });
      if (id) {
        navigate(`/groups/${id}`);
      } else {
        navigate('/friends');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!members.length) return <div className="flex justify-center p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6 pl-0 hover:bg-transparent hover:text-primary"
        onClick={() => id ? navigate(`/groups/${id}`) : navigate('/friends')}
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to {id ? 'Group' : 'Friends'}
      </Button>

      <Card className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Expense</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Description"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="text-lg"
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                step="0.01"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary-light/20 outline-none transition-all text-lg font-semibold"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Paid By</label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary-light/20 outline-none transition-all appearance-none"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
            >
              {members.map(member => (
                <option key={member.user_id} value={member.user_id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700">Split Method</label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {['equal', 'unequal', 'percentage', 'shares'].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all capitalize ${splitType === type
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
              {members.map(member => (
                <div key={member.user_id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-bold text-gray-600 border border-gray-200">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-700">{member.name}</span>

                  {splitType === 'equal' && (
                    <span className="text-gray-500 font-medium">
                      ${(splits[member.user_id] || 0).toFixed(2)}
                    </span>
                  )}

                  {splitType === 'unequal' && (
                    <div className="relative w-32">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        step="0.01"
                        className="w-full pl-6 pr-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                        value={splits[member.user_id] || ''}
                        onChange={(e) => handleSplitChange(member.user_id, e.target.value, 'amount')}
                      />
                    </div>
                  )}

                  {splitType === 'percentage' && (
                    <div className="relative w-24">
                      <input
                        type="number"
                        className="w-full pl-3 pr-6 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                        value={percentages[member.user_id] || ''}
                        onChange={(e) => handleSplitChange(member.user_id, e.target.value, 'percentage')}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                    </div>
                  )}

                  {splitType === 'shares' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none"
                        value={shares[member.user_id] || ''}
                        onChange={(e) => handleSplitChange(member.user_id, e.target.value, 'share')}
                      />
                      <span className="text-xs text-gray-500">shares</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full py-3 text-lg" disabled={loading}>
              {loading ? 'Adding Expense...' : 'Save Expense'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}