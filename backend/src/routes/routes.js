import { Router } from "express";
import {
  login,
  googleLogin,
  signup,
  getUsers,
  getUser,
  userActivity,
  getGroups,
  getGroupById,
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
  getFriends,
  addFriend,
  removeFriend,
  getUserSettings,
  updateUserSettings,
  updateUserProfile,
  updateUserPassword,
} from "../controllers/controller.js";

const router = Router();

// USERS
router.post("/login", login);
router.post("/auth/google", googleLogin);
router.post("/signup", signup);
router.get("/users", getUsers);
router.get("/users/:id", getUser);
router.get("/users/:id/activity", userActivity);

// SETTINGS
router.get("/users/:id/settings", getUserSettings);
router.put("/users/:id/settings", updateUserSettings);
router.put("/users/:id/profile", updateUserProfile);
router.put("/users/:id/password", updateUserPassword);

// FRIENDS
router.get("/friends", getFriends);
router.post("/friends", addFriend);
router.delete("/friends/:id", removeFriend);

// GROUPS
router.get("/groups", getGroups);
router.get("/groups/:id", getGroupById);
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
