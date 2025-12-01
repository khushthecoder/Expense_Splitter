import { create } from 'zustand';
import { authService, groupService, expenseService, settlementService } from '../services/api';

// Helper to calculate balances from expenses
const calculateBalances = (expenses) => {
  const bal = {};
  expenses.forEach(exp => {
    const paidBy = exp.paid_by || exp.payer?.user_id;
    const amount = parseFloat(exp.amount);

    if (!bal[paidBy]) bal[paidBy] = 0;
    bal[paidBy] += amount;

    if (exp.splits) {
      exp.splits.forEach(split => {
        const userId = split.user_id || split.user?.user_id;
        const share = parseFloat(split.share);
        if (!bal[userId]) bal[userId] = 0;
        bal[userId] -= share;
      });
    }
  });
  return bal;
};

export const useStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  theme: (() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  })(),
  groups: [],
  currentGroup: null,
  expenses: [],
  balances: {},
  notifications: [],
  loading: false,
  error: null,

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, groups: [], currentGroup: null });
  },

  // Fetch all groups for the current user
  fetchGroups: async () => {
    const { user } = get();
    if (!user) return;
    set({ loading: true });
    try {
      const res = await groupService.getAll(user.user_id);
      set({ groups: res.data, loading: false });
    } catch (error) {
      console.error("Failed to fetch groups", error);
      set({ error: "Failed to fetch groups", loading: false });
    }
  },

  // Fetch a single group details including members and expenses
  fetchGroup: async (groupId) => {
    set({ loading: true });
    try {
      const [groupRes, expensesRes, settlementsRes] = await Promise.all([
        groupService.getById(groupId),
        expenseService.getByGroup(groupId),
        settlementService.getByGroup(groupId)
      ]);

      const groupData = groupRes.data;
      const expensesData = expensesRes.data;
      const settlementsData = settlementsRes.data;

      const combinedExpenses = [
        ...expensesData,
        ...settlementsData.map(s => ({
          expense_id: `settlement-${s.settlement_id}`,
          description: 'Settlement',
          amount: s.amount,
          paid_by: s.paid_by,
          is_settlement: true,
          created_at: s.created_at,
          splits: [{ user_id: s.paid_to, share: s.amount }]
        }))
      ];

      const balances = calculateBalances(combinedExpenses);

      const formattedExpenses = combinedExpenses.map(e => ({
        ...e,
        paid_by_name: groupData.members.find(m => m.user_id === (e.paid_by || e.payer?.user_id))?.user?.name || 'Unknown'
      })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      set({
        currentGroup: groupData,
        expenses: formattedExpenses,
        balances,
        loading: false
      });
    } catch (error) {
      console.error("Failed to fetch group details", error);
      set({ error: "Failed to fetch group details", loading: false });
    }
  },

  addExpense: async (expenseData) => {
    set({ loading: true });
    try {
      const splits = Object.entries(expenseData.split).map(([userId, share]) => ({
        user_id: parseInt(userId),
        share: parseFloat(share)
      }));

      const payload = {
        group_id: expenseData.group_id,
        paid_by: expenseData.paid_by,
        amount: expenseData.amount,
        description: expenseData.description,
        splits
      };

      await expenseService.create(payload);

      get().fetchGroup(expenseData.group_id);
      get().addNotification(`New expense added: ${expenseData.description} ($${expenseData.amount})`);
    } catch (error) {
      console.error("Failed to add expense", error);
      set({ loading: false });
      throw error;
    }
  },

  deleteExpense: async (expenseId) => {
    const { currentGroup } = get();
    if (!currentGroup) return;

    try {
      await expenseService.delete(expenseId);
      get().fetchGroup(currentGroup.group_id);
      get().addNotification("Expense deleted");
    } catch (error) {
      console.error("Failed to delete expense", error);
    }
  },

  recordSettlement: async (data) => {
    set({ loading: true });
    try {
      await settlementService.create({
        group_id: data.group_id,
        paid_by: data.payer,
        paid_to: data.receiver,
        amount: data.amount
      });

      get().fetchGroup(data.group_id);
      get().addNotification(`Settlement recorded: $${data.amount}`);
    } catch (error) {
      console.error("Failed to record settlement", error);
      set({ loading: false });
      throw error;
    }
  },

  inviteMember: async (email) => {
    const { currentGroup, user } = get();
    if (!currentGroup) return;

    try {
      // Check if user exists
      const usersRes = await authService.getUsers();
      const existingUser = usersRes.data.find(u => u.email === email);

      if (existingUser) {
        await groupService.addMember(currentGroup.group_id, existingUser.user_id);
        get().addNotification(`${existingUser.name} added to group`);
      } else {
        await groupService.invite(currentGroup.group_id, {
          recipient_email: email,
          inviter_name: user.name
        });
        get().addNotification(`Invitation sent to ${email}`);
      }

      get().fetchGroup(currentGroup.group_id);
    } catch (error) {
      console.error("Failed to invite member", error);
      get().addNotification("Failed to invite member");
    }
  },

  removeMember: async (userId) => {
    const { currentGroup } = get();
    if (!currentGroup) return;

    try {
      await groupService.removeMember(currentGroup.group_id, userId);
      get().fetchGroup(currentGroup.group_id);
      get().addNotification("Member removed");
    } catch (error) {
      console.error("Failed to remove member", error);
    }
  },

  addNotification: (message) => {
    const newNotification = {
      id: Date.now(),
      message,
      time: new Date().toLocaleTimeString(),
      read: false
    };
    set(state => ({
      notifications: [newNotification, ...state.notifications]
    }));
  },

  markNotificationsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true }))
    }));
  }
}));