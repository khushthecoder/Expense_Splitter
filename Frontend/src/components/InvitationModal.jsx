import React, { useState, useEffect } from "react";
import { Mail, X, Send, Loader2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { Button, Input } from "./ui";
import { groupService } from "../services/api";

export default function InvitationModal({
  isOpen,
  onClose,
  group,
  onSuccess,
  onError,
}) {
  // Use selective selector to prevent unnecessary re-renders
  const user = useStore((state) => state.user);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setValidationError("");
      setLoading(false);
    }
  }, [isOpen]);

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!email) {
      setValidationError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setValidationError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      // Call backend API to send group invitation email
      await groupService.invite(group.group_id, {
        group_id: group.group_id,
        recipient_email: email,
        recipient_name: "", // optional
        inviter_name: user?.name || "Someone",
      });

      onSuccess(email);
      onClose();
    } catch (error) {
      console.error("Failed to send invitation:", error);
      const message =
        error?.response?.data?.error ||
        "Failed to send invitation. Please try again later.";
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Mail size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Invite Member
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Invite a friend to join <strong>{group?.name}</strong>. They will
              receive an email with instructions to join.
            </p>
            <Input
              label="Email Address"
              placeholder="friend@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={validationError}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 gap-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Invite
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
