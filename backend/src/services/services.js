import prisma from "../prisma/client.js";

const Service = {
  // USERS
  login: (email) =>
    prisma.user.findUnique({
      where: { email }
    }),

  createUser: (data) =>
    prisma.user.create({ data }),

  getAllUsers: () => prisma.user.findMany(),

  getUserById: (id) =>
    prisma.user.findUnique({
      where: { user_id: id }
    }),

  updateUser: (id, data) =>
    prisma.user.update({
      where: { user_id: id },
      data
    }),

  // SETTINGS
  getUserSettings: (user_id) =>
    prisma.userSettings.findUnique({
      where: { user_id }
    }),

  createUserSettings: (data) =>
    prisma.userSettings.create({ data }),

  updateUserSettings: (user_id, data) =>
    prisma.userSettings.upsert({
      where: { user_id },
      update: data,
      create: { user_id, ...data }
    }),

  // FRIENDS
  getFriends: (user_id) =>
    prisma.friend.findMany({
      where: {
        OR: [{ user_id }, { friend_id: user_id }],
        status: "accepted"
      },
      include: {
        user: { select: { user_id: true, name: true, email: true } },
        friend: { select: { user_id: true, name: true, email: true } }
      }
    }),

  addFriend: (user_id, friend_id) =>
    prisma.friend.create({
      data: {
        user_id,
        friend_id,
        status: "accepted"
      }
    }),

  removeFriend: (user_id, friend_id) =>
    prisma.friend.deleteMany({
      where: {
        OR: [
          { user_id, friend_id },
          { user_id: friend_id, friend_id: user_id }
        ]
      }
    }),
  //GROUPS
  getAllGroups: () =>
    prisma.group.findMany({ orderBy: { created_at: "desc" } }),

  getGroupsByUserId: (user_id) =>
    prisma.group.findMany({
      where: {
        members: {
          some: {
            user_id: user_id
          }
        }
      },
      include: {
        members: {
          include: {
            user: { select: { user_id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { created_at: "desc" }
    }),

  createGroup: (data) => prisma.group.create({ data }),

  findGroup: (id) =>
    prisma.group.findUnique({
      where: { group_id: id },
      include: {
        members: {
          include: {
            user: { select: { user_id: true, name: true, email: true } }
          }
        }
      }
    }),

  addGroupMember: (data) =>
    prisma.groupMember.create({ data }),

  findGroupMember: (group_id, user_id) =>
    prisma.groupMember.findFirst({
      where: { group_id, user_id }
    }),

  removeGroupMember: (group_id, user_id) =>
    prisma.groupMember.deleteMany({
      where: { group_id, user_id }
    }),

  findGroupMemberByEmail: async (group_id, email) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return prisma.groupMember.findFirst({
      where: { group_id, user_id: user.user_id }
    });
  },

  // EXPENSES 
  createExpense: (data) =>
    prisma.expense.create({
      data,
      include: {
        splits: {
          include: {
            user: { select: { user_id: true, name: true, email: true } }
          }
        }
      }
    }),

  getExpenseById: (id) =>
    prisma.expense.findUnique({
      where: { expense_id: id },
      include: {
        payer: { select: { user_id: true, name: true, email: true } },
        group: { select: { group_id: true, name: true, description: true } },
        splits: {
          include: {
            user: { select: { user_id: true, name: true, email: true } }
          }
        }
      }
    }),

  getExpensesByGroup: (group_id) =>
    prisma.expense.findMany({
      where: { group_id },
      include: {
        payer: { select: { user_id: true, name: true, email: true } },
        splits: {
          include: {
            user: { select: { user_id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { created_at: "desc" }
    }),

  getExpensesByUser: (user_id) =>
    prisma.expense.findMany({
      where: {
        OR: [
          { paid_by: user_id },
          { splits: { some: { user_id } } }
        ],
        group_id: null
      },
      include: {
        payer: { select: { user_id: true, name: true, email: true } },
        splits: {
          include: {
            user: { select: { user_id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { created_at: "desc" }
    }),

  deleteExpense: (id) =>
    prisma.expense.delete({
      where: { expense_id: id }
    }),

  //SETTLEMENTS
  createSettlement: (data) =>
    prisma.settlement.create({ data }),

  getSettlementsByGroup: (group_id) =>
    prisma.settlement.findMany({
      where: { group_id },
      include: {
        payer: { select: { user_id: true, name: true } },
        receiver: { select: { user_id: true, name: true } }
      },
      orderBy: { settlement_id: "desc" }
    }),

  getUserSettlements: (user_id) => ({
    paid: prisma.settlement.findMany({
      where: { paid_by: user_id },
      include: {
        receiver: { select: { user_id: true, name: true } },
        group: { select: { group_id: true, name: true } }
      }
    }),
    received: prisma.settlement.findMany({
      where: { paid_to: user_id },
      include: {
        payer: { select: { user_id: true, name: true } },
        group: { select: { group_id: true, name: true } }
      }
    })
  }),

  getUserActivity: async (user_id) => {
    const [
      expensesPaid,
      expenseShares,
      settlementsPaid,
      settlementsReceived
    ] = await Promise.all([
      prisma.expense.findMany({
        where: { paid_by: user_id },
        include: {
          group: { select: { group_id: true, name: true } },
          payer: { select: { user_id: true, name: true } }
        }
      }),
      prisma.expenseSplit.findMany({
        where: {
          user_id,
          expense: {
            paid_by: {
              not: user_id
            }
          }
        },
        include: {
          expense: {
            include: {
              group: { select: { group_id: true, name: true } },
              payer: { select: { user_id: true, name: true } }
            }
          }
        }
      }),
      prisma.settlement.findMany({
        where: { paid_by: user_id },
        include: {
          receiver: { select: { user_id: true, name: true } },
          group: { select: { group_id: true, name: true } }
        }
      }),
      prisma.settlement.findMany({
        where: { paid_to: user_id },
        include: {
          payer: { select: { user_id: true, name: true } },
          group: { select: { group_id: true, name: true } }
        }
      })
    ]);

    const formatCurrency = (value) => Number(value);

    const mapped = [
      ...expensesPaid.map((expense) => ({
        id: `expense-${expense.expense_id}`,
        type: "expense",
        title: expense.description || "Expense",
        amount: formatCurrency(expense.amount),
        date: expense.created_at,
        group: expense.group?.name || "Personal",
        details: "Paid by You",
        flow: "out"
      })),
      ...expenseShares.map((split) => ({
        id: `share-${split.split_id}`,
        type: "expense",
        title: split.expense.description || "Expense share",
        amount: formatCurrency(split.share),
        date: split.expense.created_at,
        group: split.expense.group?.name || "Personal",
        details: `Paid by ${split.expense.payer?.name || "Friend"}`,
        flow: "out"
      })),
      ...settlementsPaid.map((settlement) => ({
        id: `settlement-${settlement.settlement_id}`,
        type: "settlement",
        title: `Settled with ${settlement.receiver?.name || "friend"}`,
        amount: formatCurrency(settlement.amount),
        date: settlement.created_at,
        group: settlement.group?.name || "Personal",
        details: `Paid to ${settlement.receiver?.name || "friend"}`,
        flow: "out"
      })),
      ...settlementsReceived.map((settlement) => ({
        id: `settlement-${settlement.settlement_id}`,
        type: "settlement",
        title: `Settled with ${settlement.payer?.name || "friend"}`,
        amount: formatCurrency(settlement.amount),
        date: settlement.created_at,
        group: settlement.group?.name || "Personal",
        details: `Received from ${settlement.payer?.name || "friend"}`,
        flow: "in"
      }))
    ];

    return mapped.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
};

export default Service;
