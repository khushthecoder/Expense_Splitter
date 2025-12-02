import Service from "../services/services.js";
import { sendGroupInvitation } from "../services/emailService.js";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";

dotenv.config();

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//USERS
export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await Service.login(username);

  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

  // Return user info (excluding password)
  const { password: _, ...userInfo } = user;
  const token = jwt.sign(
    { id: user.user_id, email: user.email },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "24h" }
  );

  return res.status(200).json({
    token,
    user: {
      user_id: userInfo.user_id,
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone,
    },
  });
};

export const signup = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await Service.createUser({
      ...rest,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user.user_id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    // Return user info (excluding password)
    const { password: _, ...userInfo } = user;

    return res.status(201).json({
      token,
      user: userInfo,
    });
  } catch (err) {
    if (err.code === "P2002")
      return res.status(400).json({ error: "Credentials already exist" });

    return res.status(500).json({ error: "Internal server error" });
  }
};

export const googleLogin = async (req, res) => {
  const { token } = req.body;
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, picture } = ticket.getPayload();

    let user = await Service.login(email);

    if (!user) {
      // Create new user
      // Generate a random password since it's required
      const randomPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await Service.createUser({
        name,
        email,
        password: hashedPassword,
        // phone is optional now
      });
    }

    const jwtToken = jwt.sign(
      { id: user.user_id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    const { password: _, ...userInfo } = user;

    return res.status(200).json({
      token: jwtToken,
      user: userInfo,
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(401).json({ error: "Google authentication failed" });
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

// SETTINGS
export const getUserSettings = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    let settings = await Service.getUserSettings(userId);

    // Create default settings if they don't exist
    if (!settings) {
      settings = await Service.createUserSettings({ user_id: userId });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const updateUserSettings = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const settings = await Service.updateUserSettings(userId, req.body);
    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { name, email, phone } = req.body;

    const user = await Service.updateUser(userId, { name, email, phone });
    const { password: _, ...userInfo } = user;

    res.json(userInfo);
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Email or phone already exists" });
    }
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const updateUserPassword = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { currentPassword, newPassword } = req.body;

    const user = await Service.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Service.updateUser(userId, { password: hashedPassword });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Failed to update password" });
  }
};

// FRIENDS
export const getFriends = async (req, res) => {
  const userId = Number(req.query.user_id);
  const friends = await Service.getFriends(userId);
  res.json(friends);
};

export const addFriend = async (req, res) => {
  const { user_id, email } = req.body;
  const userId = Number(user_id);

  const friendUser = await Service.login(email);
  if (!friendUser) {
    return res.status(404).json({ error: "User not found" });
  }

  if (friendUser.user_id === userId) {
    return res.status(400).json({ error: "Cannot add yourself as friend" });
  }

  try {
    const friend = await Service.addFriend(userId, friendUser.user_id);
    res.status(201).json(friend);
  } catch (error) {
    res.status(400).json({ error: "Friendship already exists" });
  }
};

export const removeFriend = async (req, res) => {
  const userId = Number(req.query.user_id);
  const friendId = Number(req.params.id);

  try {
    await Service.removeFriend(userId, friendId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to remove friend" });
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

// Get single group by id (includes members)
export const getGroupById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid group id" });
    }

    const group = await Service.findGroup(id);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Flatten member.user into top-level properties for frontend compatibility
    const flattenedMembers = group.members.map((m) => ({
      id: m.id,
      group_id: m.group_id,
      user_id: m.user?.user_id || m.user_id,
      name: m.user?.name || null,
      email: m.user?.email || null,
      joined_at: m.joined_at,
      // keep original nested user for callers that expect it
      user: m.user,
    }));

    res.json({ ...group, members: flattenedMembers });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ error: "Failed to fetch group" });
  }
};

export const createGroup = async (req, res) => {
  const { name, description, created_by } = req.body;
  const creatorId = Number(created_by);

  // Create the group
  const group = await Service.createGroup({
    name,
    description,
    created_by: creatorId,
  });

  // Automatically add the creator as a member
  try {
    await Service.addGroupMember({
      group_id: group.group_id,
      user_id: creatorId,
    });
  } catch (error) {
    // If member already exists (shouldn't happen), continue
    console.log("Creator already a member or error adding:", error);
  }

  // Fetch the group with members included
  const groupWithMembers = await Service.findGroup(group.group_id);

  // Flatten members for frontend convenience
  const flattenedMembers = groupWithMembers.members.map((m) => ({
    id: m.id,
    group_id: m.group_id,
    user_id: m.user?.user_id || m.user_id,
    name: m.user?.name || null,
    email: m.user?.email || null,
    joined_at: m.joined_at,
    user: m.user,
  }));

  res.status(201).json({ ...groupWithMembers, members: flattenedMembers });
};

export const addMember = async (req, res) => {
  const groupId = Number(req.params.id);
  const userId = Number(req.body.user_id);

  const exists = await Service.findGroupMember(groupId, userId);
  if (exists) return res.status(409).json({ error: "User already in group" });

  const member = await Service.addGroupMember({
    group_id: groupId,
    user_id: userId,
  });

  res.status(201).json(member);
};

export const removeMember = async (req, res) => {
  const groupId = Number(req.params.id);
  const userId = Number(req.params.userId);

  try {
    await Service.removeGroupMember(groupId, userId);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to remove member" });
  }
};

// Send group invitation via email
export const sendGroupInvitationEmail = async (req, res) => {
  try {
    const { group_id, recipient_email, recipient_name, inviter_name } =
      req.body;

    // Input validation
    if (!group_id) {
      return res.status(400).json({ error: "group_id is required" });
    }

    if (!recipient_email) {
      return res.status(400).json({ error: "recipient_email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient_email)) {
      return res.status(400).json({ error: "Invalid email address format" });
    }

    const groupId = Number(group_id);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: "Invalid group_id" });
    }

    // Get group details
    const group = await Service.findGroup(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is already a member
    const existingMember = await Service.findGroupMemberByEmail(
      groupId,
      recipient_email
    );
    if (existingMember) {
      return res.status(409).json({
        error: "User is already a member of this group",
        isMember: true,
      });
    }

    // Generate invitation link
    // During local development we want links to open the Vite dev server
    // running on http://localhost:5173. When you deploy, set FRONTEND_URL
    // in your .env file to your real frontend URL.
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const invitationLink = `${baseUrl}/join-group/${groupId}?email=${encodeURIComponent(
      recipient_email
    )}`;

    // Send email via EmailJS
    const emailResult = await sendGroupInvitation(
      recipient_email,
      recipient_name || "Friend",
      inviter_name || "Someone",
      group.name,
      invitationLink
    );

    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
      invitationLink,
      emailStatus: emailResult.status,
      messageId: emailResult.messageId,
    });
  } catch (error) {
    console.error("Error sending group invitation:", error);

    // Handle specific EmailJS errors
    if (error.message.includes("EmailJS")) {
      return res.status(500).json({
        error:
          "Failed to send invitation email. Please check EmailJS configuration.",
        details: error.message,
      });
    }

    res.status(500).json({
      error: error.message || "Failed to send invitation",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// Send generic friend invitation via email
export const sendFriendInvitationEmail = async (req, res) => {
  try {
    const { recipient_email, recipient_name, inviter_name } = req.body;

    // Input validation
    if (!recipient_email) {
      return res.status(400).json({ error: "recipient_email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient_email)) {
      return res.status(400).json({ error: "Invalid email address format" });
    }

    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const invitationLink = `${baseUrl}/signup?email=${encodeURIComponent(
      recipient_email
    )}`;

    // Send email via EmailJS
    const emailResult = await sendGroupInvitation(
      recipient_email,
      recipient_name || "Friend",
      inviter_name || "Someone",
      "Expense Splitter",
      invitationLink
    );

    res.status(200).json({
      success: true,
      message: "Friend invitation sent successfully",
      invitationLink,
      emailStatus: emailResult.status,
      messageId: emailResult.messageId,
    });
  } catch (error) {
    console.error("Error sending friend invitation:", error);

    // Handle specific EmailJS errors
    if (error.message.includes("EmailJS")) {
      return res.status(500).json({
        error:
          "Failed to send invitation email. Please check EmailJS configuration.",
        details: error.message,
      });
    }

    res.status(500).json({
      error: error.message || "Failed to send friend invitation",
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
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
        return res
          .status(404)
          .json({ error: "User not found. Please sign up first." });
      }
      userId = user.user_id;
    } else {
      return res.status(400).json({ error: "Email or user_id is required" });
    }

    // Check if already a member
    const exists = await Service.findGroupMember(groupId, userId);
    if (exists) {
      return res
        .status(409)
        .json({ error: "User is already a member of this group" });
    }

    // Add member
    const member = await Service.addGroupMember({
      group_id: groupId,
      user_id: userId,
    });

    res.status(201).json({
      success: true,
      message: "Successfully joined the group",
      member,
      group: {
        group_id: group.group_id,
        name: group.name,
        description: group.description,
      },
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
    group_id: group_id ? Number(group_id) : null,
    paid_by: Number(paid_by),
    amount: Number(amount),
    description,
    splits: splits
      ? {
          create: splits.map((s) => ({
            user_id: Number(s.user_id),
            share: Number(s.share),
          })),
        }
      : undefined,
  });

  res.status(201).json(expense);
};

export const getExpense = async (req, res) => {
  const id = Number(req.params.id);
  const expense = await Service.getExpenseById(id);

  if (!expense) return res.status(404).json({ error: "Expense not found" });

  res.json(expense);
};

export const getGroupExpenses = async (req, res) => {
  const id = Number(req.params.id);
  const expenses = await Service.getExpensesByGroup(id);
  res.json(expenses);
};

export const deleteExpense = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await Service.deleteExpense(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

// SETTLEMENTS
export const createSettlement = async (req, res) => {
  const settlement = await Service.createSettlement({
    group_id: Number(req.body.group_id),
    paid_by: Number(req.body.paid_by),
    paid_to: Number(req.body.paid_to),
    amount: Number(req.body.amount),
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

// TEST EMAILJS - Remove this in production
export const testEmailJS = async (req, res) => {
  try {
    const { test_email } = req.body;

    if (!test_email) {
      return res.status(400).json({
        error: "Please provide test_email in request body",
        example: { test_email: "your-email@example.com" },
      });
    }

    // Check EmailJS configuration
    const EMAILJS_SERVICE_ID =
      process.env.EMAILJS_SERVICE_ID || "service_bh59j99";
    const EMAILJS_TEMPLATE_ID =
      process.env.EMAILJS_TEMPLATE_ID || "template_a2dqhnn";
    const EMAILJS_PUBLIC_KEY =
      process.env.EMAILJS_PUBLIC_KEY || "mJ3qmBZCtXLrJ00Lt";
    const EMAILJS_PRIVATE_KEY =
      process.env.EMAILJS_PRIVATE_KEY || "uwW92Tmu7q1rlfa9QGHKG";
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

    const configStatus = {
      EMAILJS_SERVICE_ID: EMAILJS_SERVICE_ID ? "✅ Set" : "❌ Missing",
      EMAILJS_TEMPLATE_ID: EMAILJS_TEMPLATE_ID ? "✅ Set" : "❌ Missing",
      EMAILJS_PUBLIC_KEY: EMAILJS_PUBLIC_KEY ? "✅ Set" : "❌ Missing",
      EMAILJS_PRIVATE_KEY: EMAILJS_PRIVATE_KEY ? "✅ Set" : "❌ Missing",
      FRONTEND_URL: FRONTEND_URL ? "✅ Set" : "❌ Missing",
    };

    console.log("EmailJS Configuration Check:", configStatus);

    // Try to send a test email
    const testInvitationLink = `${FRONTEND_URL}/join-group/1?email=${encodeURIComponent(
      test_email
    )}`;

    const result = await sendGroupInvitation(
      test_email,
      "Test User",
      "Expense Splitter Team",
      "Test Group",
      testInvitationLink
    );

    res.status(200).json({
      success: true,
      message: "Test email sent successfully!",
      config: configStatus,
      testResult: result,
      note: "Check your email inbox (and spam folder) for the test email.",
    });
  } catch (error) {
    console.error("EmailJS Test Error:", error);

    // Check EmailJS configuration
    const EMAILJS_SERVICE_ID =
      process.env.EMAILJS_SERVICE_ID || "service_bh59j99";
    const EMAILJS_TEMPLATE_ID =
      process.env.EMAILJS_TEMPLATE_ID || "template_a2dqhnn";
    const EMAILJS_PUBLIC_KEY =
      process.env.EMAILJS_PUBLIC_KEY || "mJ3qmBZCtXLrJ00Lt";
    const EMAILJS_PRIVATE_KEY =
      process.env.EMAILJS_PRIVATE_KEY || "uwW92Tmu7q1rlfa9QGHKG";

    res.status(500).json({
      success: false,
      error: error.message,
      config: {
        EMAILJS_SERVICE_ID: EMAILJS_SERVICE_ID ? "✅ Set" : "❌ Missing",
        EMAILJS_TEMPLATE_ID: EMAILJS_TEMPLATE_ID ? "✅ Set" : "❌ Missing",
        EMAILJS_PUBLIC_KEY: EMAILJS_PUBLIC_KEY ? "✅ Set" : "❌ Missing",
        EMAILJS_PRIVATE_KEY: EMAILJS_PRIVATE_KEY ? "✅ Set" : "❌ Missing",
      },
      troubleshooting: {
        step1: "Check if all EmailJS credentials are set in .env file",
        step2: "Verify Template ID exists in your EmailJS dashboard",
        step3: "Check if your EmailJS service is active",
        step4: "Verify Public Key and Private Key are correct",
        step5:
          "Check EmailJS account has enough credits (free tier: 200/month)",
      },
    });
  }
};
