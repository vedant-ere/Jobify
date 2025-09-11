import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const secretKey = process.env.JWT_SECRET;

const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).send({ message: "User already exists" });
    }
    const newUser = new User({ email, password });
    await newUser.save();

    const payload = {
      userId: newUser._id,
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: "24h" });
    res.status(201).json({
      message: "User Successfully registered",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        profile: newUser.profile,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).send({ message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send({ message: "Invalid credentials" });
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).send({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      message: "Profile retrieved successfully",
      user: req.user, // or specific fields you want to return
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving profile" });
  }
};

export { register, login, getProfile };
