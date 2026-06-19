import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register a new user
async function userRegister(req, res) {

  // Extract user data from request body
  const { name, email, password } = req.body;

  // Validate name
  if (!name) {
    return res.status(400).send({
      msg: "Name is required",
    });
  }

  // Validate email format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send({
      msg: "Invalid email address",
    });
  }

  // Validate password strength
  if (
    !password ||
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).send({
      msg: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number",
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).send({
        msg: "An account with this email already exists",
      });
    }

    // Hash password before saving to database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Send success response
    return res.status(201).send({
      msg: "User registered successfully",
    });

  } catch (err) {
    console.log("userRegister", err);

    // Handle unexpected server errors
    return res.status(500).send({
      msg: "Something went wrong. Please try again later",
    });
  }
}

// Authenticate user and generate JWT token
async function userLogin(req, res) {

  // Extract login credentials
  const { email, password } = req.body;

  // Validate email format
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send({
      msg: "Invalid email address",
    });
  }

  // Validate password format
  if (
    !password ||
    password.length < 8 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res.status(400).send({
      msg: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter and one number",
    });
  }

  try {
    // Find user by email
    const existingUser = await User.findOne({ email });

    // User not found
    if (!existingUser) {
      return res.status(401).send({
        msg: "User Not Found",
      });
    }

    // Compare entered password with stored hashed password
    const isMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    // Password mismatch
    if (!isMatch) {
      return res.status(401).send({
        msg: "Password does not match",
      });
    }

    // Generate JWT token valid for 1 day
    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    // Send login success response
    return res.status(200).send({
      msg: "User login successful",
      token,
      // user: existingUser, // avoid to send to client due to security issue.
    });

  } catch (err) {
    console.log("userLogin", err);

    // Handle unexpected server errors
    return res.status(500).send({
      msg: "Something went wrong. Please try again later",
    });
  }
}

// Export authentication controllers
export { userRegister, userLogin };