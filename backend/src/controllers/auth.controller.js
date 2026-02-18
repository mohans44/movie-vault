import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    const { name, username, mail, password, confirmPassword } = req.body;
    const normalizedUsername = (username || "").trim();
    const normalizedMail = (mail || "").trim().toLowerCase();

    if (!name || !username || !mail || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }
    const existingEmail = await User.findOne({
      $or: [{ mail: normalizedMail }, { email: normalizedMail }],
    });
    if (existingEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      username: normalizedUsername,
      mail: normalizedMail,
      email: normalizedMail,
      password: hashedPassword,
      logged: [],
      watchlist: [],
      joined: new Date(),
    });
    const token = jwt.sign({ user_id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "3h",
    });
    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        name: user.name,
        username: user.username,
        logged: user.logged,
        watchlist: user.watchlist,
        joined: user.joined,
      },
    });
  } catch (err) {
    if (err?.code === 11000) {
      const duplicateField =
        Object.keys(err.keyPattern || {})[0] ||
        (typeof err.message === "string" && err.message.match(/index:\s+([a-zA-Z0-9_]+)_1/)?.[1]);
      if (duplicateField === "username") {
        return res.status(409).json({ error: "Username already exists" });
      }
      if (duplicateField === "mail" || duplicateField === "email") {
        return res.status(409).json({ error: "Email already exists" });
      }
      return res.status(409).json({ error: "Account already exists" });
    }

    if (err?.name === "ValidationError") {
      const firstError = Object.values(err.errors || {})[0];
      return res
        .status(400)
        .json({ error: firstError?.message || "Invalid signup data" });
    }

    if (err?.name === "MongoServerSelectionError") {
      return res.status(503).json({
        error: "Database unavailable. Please try again shortly.",
      });
    }

    return res.status(500).json({
      error: "Failed to register user",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { user, password } = req.body;
    const normalizedUser = (user || "").trim();

    if (!normalizedUser || !password) {
      return res
        .status(400)
        .json({ error: "Username/Email and Password are required" });
    }
    const foundUser = await User.findOne({
      $or: [
        { username: normalizedUser },
        { mail: normalizedUser.toLowerCase() },
        { email: normalizedUser.toLowerCase() },
      ],
    });
    if (!foundUser) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ user_id: foundUser._id }, process.env.SECRET_KEY, {
      expiresIn: "3h",
    });
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        name: foundUser.name,
        username: foundUser.username,
        logged: foundUser.logged,
        watchlist: foundUser.watchlist,
        joined: foundUser.joined,
      },
    });
  } catch (err) {
    if (err?.name === "MongoServerSelectionError") {
      return res.status(503).json({
        error: "Database unavailable. Please try again shortly.",
      });
    }

    return res.status(500).json({
      error: "Login failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};
