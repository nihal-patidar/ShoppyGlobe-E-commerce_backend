import jwt from "jsonwebtoken";

// Middleware to verify JWT token and protect routes
async function auth(req, res, next) {
  try {
    // Extract token from Authorization header
    // Format: Bearer <token>
    const token = req.headers?.authorization?.split(" ")[1];

    // Token not provided
    if (!token) {
      return res.status(401).send({
        msg: "Authentication token is required",
      });
    }

    // Verify and decode token
    const data = jwt.verify(token, process.env.JWT_KEY);

    // Attach authenticated user's id to request object
    req.user = {
      userId: data.userId,
    };

    // Pass control to next middleware/controller
    next();

  } catch (err) {
    // Invalid or expired token
    return res.status(401).send({
      msg: "Invalid or expired token",
    });
  }
}

export default auth;