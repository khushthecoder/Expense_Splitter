import emailjs from "@emailjs/nodejs";
import dotenv from "dotenv";

dotenv.config();

// EmailJS configuration - using environment variables with fallback to provided service_id
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID =
  process.env.EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY =
  process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_PRIVATE_KEY =
  process.env.EMAILJS_PRIVATE_KEY;

/**
 * Send a group invitation email via EmailJS
 * @param {string} recipientEmail - Email address of the person being invited
 * @param {string} recipientName - Name of the person being invited
 * @param {string} inviterName - Name of the person sending the invitation
 * @param {string} groupName - Name of the group they're being invited to
 * @param {string} invitationLink - Link to join the group
 * @returns {Promise<{success: boolean, messageId: string}>}
 */
export const sendGroupInvitation = async (
  recipientEmail,
  recipientName,
  inviterName,
  groupName,
  invitationLink
) => {
  try {
    // Validate required EmailJS credentials
    if (
      !EMAILJS_SERVICE_ID ||
      !EMAILJS_TEMPLATE_ID ||
      !EMAILJS_PUBLIC_KEY ||
      !EMAILJS_PRIVATE_KEY
    ) {
      throw new Error(
        "EmailJS credentials not configured. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY in .env file."
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      throw new Error("Invalid email address format");
    }

    // Prepare template parameters for EmailJS
    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName || "Friend",
      from_name: inviterName || "Someone",
      group_name: groupName || "Expense Splitter Group",
      invitation_link: invitationLink,
      reply_to: process.env.REPLY_TO_EMAIL || recipientEmail,
      // Additional helpful fields
      app_name: "Expense Splitter",
      year: new Date().getFullYear().toString(),
    };

    console.log("=".repeat(50));
    console.log("📧 EmailJS - Sending Invitation Email");
    console.log("=".repeat(50));
    console.log("Configuration:");
    console.log(`  Service ID: ${EMAILJS_SERVICE_ID}`);
    console.log(`  Template ID: ${EMAILJS_TEMPLATE_ID}`);
    console.log(
      `  Public Key: ${
        EMAILJS_PUBLIC_KEY
          ? EMAILJS_PUBLIC_KEY.substring(0, 10) + "..."
          : "MISSING"
      }`
    );
    console.log(
      `  Private Key: ${
        EMAILJS_PRIVATE_KEY
          ? "***" +
            EMAILJS_PRIVATE_KEY.substring(EMAILJS_PRIVATE_KEY.length - 4)
          : "MISSING"
      }`
    );
    console.log("\nEmail Details:");
    console.log(`  To: ${recipientEmail}`);
    console.log(`  Recipient Name: ${recipientName}`);
    console.log(`  From: ${inviterName}`);
    console.log(`  Group: ${groupName}`);
    console.log(`  Invitation Link: ${invitationLink}`);
    console.log("=".repeat(50));

    // Send email via EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
      }
    );

    console.log("✅ Email sent successfully!");
    console.log("Response:", {
      status: response.status,
      statusText: response.text,
      messageId: response.text,
    });
    console.log("=".repeat(50));
    return {
      success: true,
      messageId: response.text,
      status: response.status,
    };
  } catch (error) {
    console.error("Error sending email via EmailJS:", error);

    // Provide more detailed error messages
    if (error.text) {
      throw new Error(`EmailJS error: ${error.text}`);
    }

    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
};

/**
 * Send a friend invitation email (for inviting someone to join the app)
 * @param {string} recipientEmail - Email address of the person being invited
 * @param {string} recipientName - Name of the person being invited
 * @param {string} inviterName - Name of the person sending the invitation
 * @param {string} invitationLink - Link to sign up
 * @returns {Promise<{success: boolean, messageId: string}>}
 */
export const sendFriendInvitation = async (
  recipientEmail,
  recipientName,
  inviterName,
  invitationLink
) => {
  try {
    // Use the same EmailJS service but with friend invitation template
    // You can create a separate template for friend invitations if needed
    return await sendGroupInvitation(
      recipientEmail,
      recipientName,
      inviterName,
      "Expense Splitter", // App name instead of group name
      invitationLink
    );
  } catch (error) {
    console.error("Error sending friend invitation:", error);
    throw error;
  }
};
