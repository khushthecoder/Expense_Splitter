import { Router } from "express";
import {
  login,
  signup,
  getUsers,
  getUser,
  userActivity,
  getGroups,
  createGroup,
  addMember,
  removeMember,
  sendGroupInvitationEmail,
  sendFriendInvitationEmail,
  joinGroupViaInvitation,
  createExpense,
  getExpense,
  getGroupExpenses,
  deleteExpense,
  createSettlement,
  userSettlements,
  groupSettlements,
} from "../controllers/controller.js";

const router = Router();

// USERS
router.post("/login", login);
router.post("/signup", signup);
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.get("/users/:id/activity", userActivity);

// GROUPS
router.get("/groups", getGroups);
router.post("/groups", createGroup);
router.post("/groups/:id/members", addMember);
router.delete("/groups/:id/members/:userId", removeMember);
router.post("/groups/:id/invite", sendGroupInvitationEmail);
router.post("/groups/:group_id/join", joinGroupViaInvitation);
router.post("/friends/invite", sendFriendInvitationEmail);

// EXPENSES
router.post("/expenses", createExpense);
router.get("/expenses/:id", getExpense);
router.get("/groups/:id/expenses", getGroupExpenses);
router.delete("/expenses/:id", deleteExpense);

// SETTLEMENTS
router.post("/settlements", createSettlement);
router.get("/users/:id/settlements", userSettlements);
router.get("/groups/:id/settlements", groupSettlements);

export default router;
