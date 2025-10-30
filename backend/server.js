import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import { PrismaClient } from "@prisma/client";
// @prisma/client is an auto-generated and type-safe database client created for your schema.
//When you run: npx prisma generate
//The Prisma Client is an auto-generated database client (library) that Prisma builds for you, based on your schema.prisma

const app = express();
const prisma = new PrismaClient();
//new PrismaClient() creates an instance
//you are creating a connection manager to your database.
app.use(cors());
app.use(express.json());

// It tells Express (your web server framework) to use the built-in middleware express.json().
// This middleware automatically parses incoming request bodies that are in JSON format.
// After parsing, it attaches the result to req.body
prisma
  .$connect()
  .then(() => {
    console.log("Prisma connected");
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, (err) => {
      if (err) {
        console.log(`Error starting server on port ${PORT}`, err);
      } else {
        console.log(`Server running on http://localhost:${PORT}`);
      }
    });
  })
  .catch((err) => console.error("Prisma connection error:", err));

// USERS

app.get("/", (req, res) => {
  res.send("OK");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body)
  if (!username || !password) {
    return res.status(400).json({ error: "Bad request" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: username },
    });

    if (user && user.password === password) {
      return res.status(200).json({ token: "Token" });
    }
    return res.status(401).json({ error: "Invalid credentials" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/signup", async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    console.log(req.body);
    if (!name || !phone || !email || !password) {
      res.status(400).json({ error: "Bad Request" });
    }
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password,
      },
    });
    res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002") {
      res.status(400).json({ error: "Credentials already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/users", async (req, res) => {
  console.log("Hit GET /users");
  try {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Create a user
app.post("/users", async (req, res) => {
  console.log("Hit POST /users");
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ error: "name, email and phone are required" });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
      },
    });
    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    //Prisma duplication err code
    if (err?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Unique constraint failed (probably email)" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by id
app.get("/users/:id", async (req, res) => {
  console.log("Hit GET /users/:id");
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId))
      return res.status(400).json({ error: "User Id must be a number" });

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) return res.status(404).json({ error: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GROUPS

// Create group
app.post("/groups", async (req, res) => {
  console.log("Hit POST /groups");
  try {
    const { name, description, created_by } = req.body;
    if (!name || !description || created_by == null) {
      return res
        .status(400)
        .json({ error: "name, description and created_by are required" });
    }
    const creatorId = parseInt(created_by, 10);
    if (isNaN(creatorId))
      return res.status(400).json({ error: "created_by must be a number" });

    const user = await prisma.user.findUnique({
      where: { user_id: creatorId },
    });
    if (!user) return res.status(404).json({ error: "Creator user not found" });

    const group = await prisma.group.create({
      data: {
        name,
        description,
        created_by: creatorId,
      },
    });
    return res.status(201).json(group);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Add member to group
app.post("/groups/:id/members", async (req, res) => {
  console.log("Hit POST /groups/:id/members");
  try {
    const groupId = parseInt(req.params.id, 10);
    if (isNaN(groupId))
      return res.status(400).json({ error: "Invalid group id" });

    const userId = parseInt(req.body.user_id, 10);
    if (isNaN(userId))
      return res
        .status(400)
        .json({ error: "User id is required and must be a number" });

    const group = await prisma.group.findUnique({
      where: { group_id: groupId },
    });
    if (!group) return res.status(404).json({ error: "Group not found" });

    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const existingMember = await prisma.groupMember.findFirst({
      where: { group_id: groupId, user_id: userId },
    });
    if (existingMember)
      return res.status(409).json({ error: "User already in this group" });

    const member = await prisma.groupMember.create({
      data: { group_id: groupId, user_id: userId },
    });
    return res.status(201).json(member);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/groups/:id", async (req, res) => {
  console.log("Hit GET /groups/:id");
  try {
    const groupId = parseInt(req.params.id, 10);
    if (isNaN(groupId))
      return res.status(400).json({ error: "Invalid Group id" });

    const group = await prisma.group.findUnique({
      where: { group_id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: {
                user_id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!group) return res.status(404).json({ error: "Group Not Found" });

    return res.status(200).json({
      group_id: group.group_id,
      name: group.name,
      description: group.description,
      created_by: group.created_by,
      created_at: group.created_at,
      members: group.members.map((m) => m.user),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// ----------- EXPENSES ------------

// Create expense (basic)
app.post("/expenses", async (req, res) => {
  console.log("Hit POST /expenses");
  try {
    const { group_id, paid_by, amount, description } = req.body;
    if (group_id == null || paid_by == null || amount == null) {
      return res
        .status(400)
        .json({ error: "group_id, paid_by, and amount are required" });
    }

    const groupId = parseInt(group_id, 10);
    const paidById = parseInt(paid_by, 10);
    const amt = Number(amount);

    if (isNaN(groupId) || isNaN(paidById) || isNaN(amt)) {
      return res.status(400).json({
        error: "group_id, paid_by must be numbers and amount must be numeric",
      });
    }

    const group = await prisma.group.findUnique({
      where: { group_id: groupId },
    });
    if (!group) return res.status(404).json({ error: "Group not found" });

    const user = await prisma.user.findUnique({ where: { user_id: paidById } });
    if (!user) return res.status(404).json({ error: "User (payer) not found" });

    const expense = await prisma.expense.create({
      data: {
        group_id: groupId,
        paid_by: paidById,
        amount: amt,
        description: description ?? null,
      },
    });

    return res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/expenses/:id", async (req, res) => {
  console.log("Hit GET /expenses/:id");
  try {
    const expenseId = parseInt(req.params.id, 10);
    if (isNaN(expenseId))
      return res.status(400).json({ error: "Invalid expense id" });

    const expense = await prisma.expense.findUnique({
      where: { expense_id: expenseId },
      include: {
        payer: { select: { user_id: true, name: true, email: true } },
        group: { select: { group_id: true, name: true, description: true } },
        splits: {
          include: {
            user: { select: { user_id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!expense) return res.status(404).json({ error: "Expense not found" });

    return res.status(200).json({
      expense_id: expense.expense_id,
      description: expense.description,
      amount: expense.amount,
      created_at: expense.created_at,
      group: expense.group,
      paid_by: expense.payer,
      splits: expense.splits.map((s) => ({
        user: s.user,
        share: s.share ?? s.amount ?? null,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/groups/:id/expenses", async (req, res) => {
  console.log("Hit GET /groups/:id/expenses");
  try {
    const groupId = parseInt(req.params.id, 10);
    if (isNaN(groupId))
      return res.status(400).json({ error: "Invalid group id" });

    const group = await prisma.group.findUnique({
      where: { group_id: groupId },
    });
    if (!group) return res.status(404).json({ error: "Group not found" });

    const expenses = await prisma.expense.findMany({
      where: { group_id: groupId },
      include: {
        payer: { select: { user_id: true, name: true, email: true } },
        splits: {
          include: {
            user: { select: { user_id: true, name: true, email: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    return res.status(200).json(
      expenses.map((exp) => ({
        expense_id: exp.expense_id,
        description: exp.description,
        amount: exp.amount,
        created_at: exp.created_at,
        paid_by: exp.payer,
        splits: exp.splits.map((s) => ({
          user: s.user,
          share: s.share ?? s.amount ?? null,
        })),
      }))
    );
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/groups/:id/balance", async (req, res) => {
  console.log("Hit GET /groups/:id/balance");
  try {
    const groupId = parseInt(req.params.id, 10);
    if (isNaN(groupId))
      return res.status(400).json({ error: "Invalid group id" });

    const members = await prisma.groupMember.findMany({
      where: { group_id: groupId },
      include: { user: true },
    });

    if (!members || members.length === 0) {
      return res.status(404).json({ error: "No member found in this group" });
    }

    const balances = {};
    members.forEach((member) => {
      const uid = member.user.user_id;
      balances[uid] = 0;
    });

    const expenses = await prisma.expense.findMany({
      where: { group_id: groupId },
      include: { splits: { include: { user: true } } },
    });

    expenses.forEach((exp) => {
      if (exp.paid_by)
        balances[exp.paid_by] =
          (balances[exp.paid_by] ?? 0) + Number(exp.amount);

      exp.splits.forEach((split) => {
        const uid = split.user ? split.user.user_id : split.user_id;
        const share = Number(split.share ?? split.amount ?? 0);
        balances[uid] = (balances[uid] ?? 0) - share;
      });
    });

    // apply settlements
    const settlements = await prisma.settlement.findMany({
      where: { group_id: groupId },
    });
    settlements.forEach((settle) => {
      if (settle.paid_by)
        balances[settle.paid_by] =
          (balances[settle.paid_by] ?? 0) - Number(settle.amount);
      if (settle.paid_to)
        balances[settle.paid_to] =
          (balances[settle.paid_to] ?? 0) + Number(settle.amount);
    });

    return res.status(200).json(balances);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//SETTLEMENTS

app.post("/settlements", async (req, res) => {
  console.log("Hit POST /settlements");
  try {
    const { group_id, paid_by, paid_to, amount } = req.body;
    if (
      group_id == null ||
      paid_by == null ||
      paid_to == null ||
      amount == null
    ) {
      return res
        .status(400)
        .json({ error: "group_id, paid_by, paid_to, and amount are required" });
    }

    const groupId = parseInt(group_id, 10);
    const paidById = parseInt(paid_by, 10);
    const paidToId = parseInt(paid_to, 10);
    const amt = Number(amount);

    if (
      isNaN(groupId) ||
      isNaN(paidById) ||
      isNaN(paidToId) ||
      isNaN(amt) ||
      amt <= 0
    ) {
      return res.status(400).json({ error: "Invalid numeric values" });
    }
    if (paidById === paidToId)
      return res
        .status(400)
        .json({ error: "Payer and receiver cannot be the same user" });

    const group = await prisma.group.findUnique({
      where: { group_id: groupId },
    });
    if (!group) return res.status(404).json({ error: "Group not found" });

    const payer = await prisma.user.findUnique({
      where: { user_id: paidById },
    });
    const receiver = await prisma.user.findUnique({
      where: { user_id: paidToId },
    });
    if (!payer || !receiver)
      return res.status(404).json({ error: "Payer or receiver not found" });

    const payerMember = await prisma.groupMember.findFirst({
      where: { group_id: groupId, user_id: paidById },
    });
    const receiverMember = await prisma.groupMember.findFirst({
      where: { group_id: groupId, user_id: paidToId },
    });
    if (!payerMember || !receiverMember)
      return res
        .status(400)
        .json({ error: "Both users must be members of the group" });

    const settlement = await prisma.settlement.create({
      data: {
        group_id: groupId,
        paid_by: paidById,
        paid_to: paidToId,
        amount: amt,
      },
    });

    return res.status(201).json(settlement);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/users/:id/settlements", async (req, res) => {
  console.log("Hit GET /users/:id/settlements");
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId))
      return res.status(400).json({ error: "Invalid user id" });

    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const settlementsPaid = await prisma.settlement.findMany({
      where: { paid_by: userId },
      include: {
        receiver: { select: { user_id: true, name: true } },
        group: { select: { group_id: true, name: true } },
      },
    });

    const settlementsReceived = await prisma.settlement.findMany({
      where: { paid_to: userId },
      include: {
        payer: { select: { user_id: true, name: true } },
        group: { select: { group_id: true, name: true } },
      },
    });

    return res.status(200).json({
      user: { user_id: user.user_id, name: user.name },
      settlementsPaid,
      settlementsReceived,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/groups/:id/settlements", async (req, res) => {
  console.log("Hit GET /groups/:id/settlements");
  try {
    const groupId = parseInt(req.params.id, 10);
    if (isNaN(groupId))
      return res.status(400).json({ error: "Invalid group id" });

    const group = await prisma.group.findUnique({
      where: { group_id: groupId },
    });
    if (!group) return res.status(404).json({ error: "Group not found" });

    const settlements = await prisma.settlement.findMany({
      where: { group_id: groupId },
      include: {
        payer: { select: { user_id: true, name: true } },
        receiver: { select: { user_id: true, name: true } },
      },
      orderBy: { id: "desc" },
    });

    return res.status(200).json({
      group: { group_id: group.group_id, name: group.name },
      settlements,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
