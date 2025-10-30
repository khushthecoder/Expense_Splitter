// src/services/auth.js
export const googleLogin = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    alert('Error: Google Client ID not configured. Check .env file.');
    return;
  }

  const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
  const scope = encodeURIComponent("email profile");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=token&` +
    `scope=${scope}&` +
    `prompt=select_account`;

  window.location.href = authUrl;
};