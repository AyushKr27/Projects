import jwt from "jsonwebtoken";

const ACCESS_SECRET =
  process.env.ACCESS_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "verysecret_access";

/**
 * ================================
 * REST API AUTH MIDDLEWARE
 * ================================
 */
export function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);

    // ✅ STANDARDIZE
    const userId = decoded.uid || decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.userId = userId;
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Token invalid or expired" });
  }
}

/**
 * ================================
 * SOCKET.IO AUTH MIDDLEWARE
 * ================================
 */
export function socketAuth(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, ACCESS_SECRET);

      // ✅ SAME USER ID EVERYWHERE
      const userId = decoded.uid || decoded.id || decoded._id;
      if (!userId) return next(new Error("Invalid token payload"));

      socket.data.userId = userId;
      socket.data.user = decoded;

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });
}
