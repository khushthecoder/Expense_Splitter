import Service from "../services/services.js";
import { sendGroupInvitation } from "../services/emailService.js";

//USERS 
export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await Service.login(username);

  if (!user || user.password !== password)
    return res.status(401).json({ error: "Invalid credentials" });

  // Return user info (excluding password)
  const { password: _, ...userInfo } = user;
  return res.status(200).json({ 
    token: "Token",
    user: {
      user_id: userInfo.user_id,
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone
    }
  });
};

export const signup = async (req, res) => {
  try {
    const user = await Service.createUser(req.body);
    return res.status(201).json(user);
  } catch (err) {
    if (err.code === "P2002")
      return res.status(400).json({ error: "Credentials already exist" });

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUsers = async (_, res) => {
  const users = await Service.getAllUsers();
  return res.json(users);
};

export const getUser = async (req, res) => {
  const id = Number(req.params.id);
  const user = await Service.getUserById(id);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(user);
};

export const userActivity = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const activity = await Service.getUserActivity(id);
    res.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ error: "Failed to fetch user activity" });
  }
};

// GROUPS 
export const getGroups = async (req, res) => {
  // If user_id is provided, get groups for that user, otherwise get all groups
  const userId = req.query.user_id ? Number(req.query.user_id) : null;
  
  if (userId) {
    const groups = await Service.getGroupsByUserId(userId);
    res.json(groups);
  } else {
    const groups = await Service.getAllGroups();
    res.json(groups);
  }
};

export const createGroup = async (req, res) => {
  const { name, description, created_by } = req.body;
  const creatorId = Number(created_by);
  
  // Create the group
  const group = await Service.createGroup({
    name,
    description,
    created_by: creatorId
  });

  // Automatically add the creator as a member
  try {
    await Service.addGroupMember({
      group_id: group.group_id,
      user_id: creatorId
    });
  } catch (error) {
    // If member already exists (shouldn't happen), continue
    console.log("Creator already a member or error adding:", error);
  }

  // Fetch the group with members included
  const groupWithMembers = await Service.findGroup(group.group_id);
  
  res.status(201).json(groupWithMembers);
};

export const addMember = async (req, res) => {
  const groupId = Number(req.params.id);
  const userId = Number(req.body.user_id);

  const exists = await Service.findGroupMember(groupId, userId);
  if (exists)
    return res.status(409).json({ error: "User already in group" });

  const member = await Service.addGroupMember({
    group_id: groupId,
    user_id: userId
  });

  res.status(201).json(member);
};

// Send group invitation via email
export const sendGroupInvitationEmail = async (req, res) => {
  try {
    const { group_id, recipient_email, recipient_name, inviter_name } = req.body;
    const groupId = Number(group_id);

    // Get group details
    const group = await Service.findGroup(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is already a member
    const existingMember = await Service.findGroupMemberByEmail(groupId, recipient_email);
    if (existingMember) {
      return res.status(409).json({ error: "User is already a member of this group" });
    }

    // Generate invitation link
    // For now, we'll use a simple link with group_id
    // In production, you might want to use a secure token
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:8081";
    const invitationLink = `${baseUrl}/join-group/${groupId}?email=${encodeURIComponent(recipient_email)}`;

    // Send email
    await sendGroupInvitation(
      recipient_email,
      recipient_name || "Friend",
      inviter_name || "Someone",
      group.name,
      invitationLink
    );

    res.status(200).json({ 
      success: true, 
      message: "Invitation sent successfully",
      invitationLink 
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({ error: error.message || "Failed to send invitation" });
  }
};

// Send generic friend invitation via email
export const sendFriendInvitationEmail = async (req, res) => {
  try {
    const { recipient_email, recipient_name, inviter_name } = req.body;

    if (!recipient_email) {
      return res.status(400).json({ error: "recipient_email is required" });
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:8081";
    const invitationLink = `${baseUrl}/signup?email=${encodeURIComponent(
      recipient_email
    )}`;

    await sendGroupInvitation(
      recipient_email,
      recipient_name || "Friend",
      inviter_name || "Someone",
      "Splitly",
      invitationLink
    );

    res.status(200).json({
      success: true,
      message: "Friend invitation sent successfully",
      invitationLink,
    });
  } catch (error) {
    console.error("Error sending friend invitation:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to send friend invitation" });
  }
};

// Join group via invitation link
export const joinGroupViaInvitation = async (req, res) => {
  try {
    const group_id = req.params.group_id || req.params.id;
    const { email, user_id } = req.body;
    const groupId = Number(group_id);

    // Get group
    const group = await Service.findGroup(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Find user by email or use provided user_id
    let userId;
    if (user_id) {
      userId = Number(user_id);
    } else if (email) {
      const user = await Service.login(email);
      if (!user) {
        return res.status(404).json({ error: "User not found. Please sign up first." });
      }
      userId = user.user_id;
    } else {
      return res.status(400).json({ error: "Email or user_id is required" });
    }

    // Check if already a member
    const exists = await Service.findGroupMember(groupId, userId);
    if (exists) {
      return res.status(409).json({ error: "User is already a member of this group" });
    }

    // Add member
    const member = await Service.addGroupMember({
      group_id: groupId,
      user_id: userId
    });

    res.status(201).json({ 
      success: true, 
      message: "Successfully joined the group",
      member,
      group: {
        group_id: group.group_id,
        name: group.name,
        description: group.description
      }
    });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ error: error.message || "Failed to join group" });
  }
};

// EXPENSES 
export const createExpense = async (req, res) => {
  const { group_id, paid_by, amount, description, splits } = req.body;

  const expense = await Service.createExpense({
    group_id: Number(group_id),
    paid_by: Number(paid_by),
    amount: Number(amount),
    description,
    splits: splits
      ? {
          create: splits.map((s) => ({
            user_id: Number(s.user_id),
            share: Number(s.share)
          }))
        }
      : undefined
  });

  res.status(201).json(expense);
};

export const getExpense = async (req, res) => {
  const id = Number(req.params.id);
  const expense = await Service.getExpenseById(id);

  if (!expense)
    return res.status(404).json({ error: "Expense not found" });

  res.json(expense);
};

export const getGroupExpenses = async (req, res) => {
  const id = Number(req.params.id);
  const expenses = await Service.getExpensesByGroup(id);
  res.json(expenses);
};

// SETTLEMENTS
export const createSettlement = async (req, res) => {
  const settlement = await Service.createSettlement({
    group_id: Number(req.body.group_id),
    paid_by: Number(req.body.paid_by),
    paid_to: Number(req.body.paid_to),
    amount: Number(req.body.amount)
  });

  res.status(201).json(settlement);
};

export const userSettlements = async (req, res) => {
  const id = Number(req.params.id);
  const data = await Service.getUserSettlements(id);
  res.json(data);
};

export const groupSettlements = async (req, res) => {
  const id = Number(req.params.id);
  const settlements = await Service.getSettlementsByGroup(id);
  res.json(settlements);
};
