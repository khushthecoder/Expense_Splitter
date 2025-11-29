import emailjs from "@emailjs/nodejs";

// Email.js configuration
const EMAILJS_SERVICE_ID = "service_ea22tua";
const EMAILJS_TEMPLATE_ID='template_a2dqhnn'
const EMAILJS_PUBLIC_KEY = 'mJ3qmBZCtXLrJ00Lt';
const EMAILJS_PRIVATE_KEY = 'uwW92Tmu7q1rlfa9QGHKG';


export const sendGroupInvitation = async (
  recipientEmail,
  recipientName,
  inviterName,
  groupName,
  invitationLink
) => {
  try {
    if (!EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY || !EMAILJS_PRIVATE_KEY) {
      throw new Error(
        "Email.js credentials not configured. Please set EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, and EMAILJS_PRIVATE_KEY in .env file."
      );
    }

    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName || "Friend",
      from_name: inviterName,
      group_name: groupName,
      invitation_link: invitationLink,
      reply_to: process.env.REPLY_TO_EMAIL || recipientEmail,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: EMAILJS_PUBLIC_KEY,
        privateKey: EMAILJS_PRIVATE_KEY,
      }
    );

    console.log("Email sent successfully:", response);
    return { success: true, messageId: response.text };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
};

