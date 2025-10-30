// src/store/useStore.js
import { create } from 'zustand';

const mockGroups = [
  {
    group_id: 1,
    name: 'Goa Trip 2025',
    description: 'Vacation with friends',
    created_at: '2025-10-01',
    members: [
      { user_id: 101, name: 'Harsh Ahlawat' },
      { user_id: 102, name: 'Priya Sharma' },
      { user_id: 103, name: 'Aman Verma' }
    ],
    expenses: [
      {
        expense_id: 1,
        description: 'Hotel Booking',
        amount: 4500,
        paid_by: 101,
        paid_by_name: 'Harsh Ahlawat',
        split: { '101': 1500, '102': 1500, '103': 1500 },
        created_at: '2025-10-05'
      },
      {
        expense_id: 2,
        description: 'Dinner at Beach',
        amount: 1800,
        paid_by: 102,
        paid_by_name: 'Priya Sharma',
        split: { '101': 600, '102': 600, '103': 600 },
        created_at: '2025-10-06'
      }
    ]
  },
  {
    group_id: 2,
    name: 'Roommates',
    description: 'Flat 402, Sector 15',
    created_at: '2025-09-01',
    members: [
      { user_id: 101, name: 'Harsh Ahlawat' },
      { user_id: 104, name: 'Rohan Singh' }
    ],
    expenses: [
      {
        expense_id: 3,
        description: 'Electricity Bill',
        amount: 1200,
        paid_by: 101,
        paid_by_name: 'Harsh Ahlawat',
        split: { '101': 600, '102': 600 },
        created_at: '2025-10-10'
      }
    ]
  }
];

const calculateBalances = (expenses) => {
  const bal = {};
  expenses.forEach(exp => {
    const paidBy = exp.paid_by;
    const amount = parseFloat(exp.amount);
    const split = exp.split || {};

    bal[paidBy] = (bal[paidBy] || 0) + amount;
    Object.keys(split).forEach(user => {
      const share = parseFloat(split[user] || 0);
      bal[user] = (bal[user] || 0) - share;
    });
  });
  return bal;
};

export const useStore = create((set, get) => ({
  user: null,
  groups: [],
  currentGroup: null,
  expenses: [],
  balances: {},

  setUser: (user) => set({ user }),

  logout: () => {
    set({ user: null, groups: [], currentGroup: null });
    window.location.href = '/login';
  },

  fetchGroups: () => {
    set({ groups: mockGroups });
  },

  fetchGroup: (id) => {
    const group = mockGroups.find(g => g.group_id === parseInt(id));
    if (group) {
      const balances = calculateBalances(group.expenses);
      set({
        currentGroup: group,
        expenses: group.expenses,
        balances
      });
    }
  },

  addExpense: (expense) => {
    const { currentGroup } = get();
    const newExpense = {
      ...expense,
      expense_id: Date.now(),
      paid_by_name: currentGroup.members.find(m => m.user_id === expense.paid_by)?.name || 'Unknown',
      created_at: new Date().toISOString().split('T')[0]
    };

    const updatedExpenses = [...currentGroup.expenses, newExpense];
    const balances = calculateBalances(updatedExpenses);

    set({
      expenses: updatedExpenses,
      balances,
      currentGroup: {
        ...currentGroup,
        expenses: updatedExpenses
      }
    });
  },
}));