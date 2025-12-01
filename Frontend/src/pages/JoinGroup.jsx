import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { Card, Button } from "../components/ui";
import { CheckCircle, XCircle, Loader, Users, Mail } from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function JoinGroup() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("loading"); // loading, success, error, needs-auth
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");

  const email = searchParams.get("email");

  useEffect(() => {
    handleJoinGroup();
  }, [id, user]);

  const handleJoinGroup = async () => {
    try {
      setLoading(true);

      // If user is not logged in, redirect to login with return URL
      if (!user) {
        setStatus("needs-auth");
        setMessage("Please log in or sign up to join this group");
        return;
      }

      // Call the join group API
      const response = await axios.post(`${API_URL}/groups/${id}/join`, {
        email: email || user.email,
        user_id: user.user_id,
      });

      if (response.data.success) {
        setStatus("success");
        setGroupName(response.data.group?.name || "the group");
        setMessage(response.data.message || "Successfully joined the group!");

        // Redirect to group page after 2 seconds
        setTimeout(() => {
          navigate(`/groups/${id}`);
        }, 2000);
      }
    } catch (error) {
      console.error("Error joining group:", error);
      setStatus("error");

      if (error.response?.status === 409) {
        setMessage("You are already a member of this group");
      } else if (error.response?.status === 404) {
        setMessage("Group not found or invitation link is invalid");
      } else {
        setMessage(
          error.response?.data?.error ||
            "Failed to join group. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    // Save the invitation link to redirect after login
    const returnUrl = `/join-group/${id}${
      email ? `?email=${encodeURIComponent(email)}` : ""
    }`;
    navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
  };

  if (status === "needs-auth") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="text-blue-600 dark:text-blue-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Join Group Invitation
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message || "You need to be logged in to join this group"}
          </p>
          {email && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <Mail size={16} />
              <span>Invited as: {email}</span>
            </div>
          )}
          <div className="flex gap-3">
            <Button onClick={handleLogin} className="flex-1">
              Log In / Sign Up
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate("/")}
              className="flex-1"
            >
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {loading ? (
          <>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Loader className="text-blue-600 dark:text-blue-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Joining Group...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we add you to the group
            </p>
          </>
        ) : status === "success" ? (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle
                className="text-green-600 dark:text-green-400"
                size={32}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Success!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            {groupName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                You've been added to <strong>{groupName}</strong>
              </p>
            )}
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Redirecting to group page...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Unable to Join
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/groups")} className="flex-1">
                View My Groups
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/")}
                className="flex-1"
              >
                Go Home
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
