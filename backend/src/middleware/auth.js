export default function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  if (token !== "Token") return res.status(401).json({ error: "Invalid token" });

  next();
}
