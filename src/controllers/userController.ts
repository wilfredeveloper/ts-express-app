import { Request, Response } from "express";
import User, { UserRole } from "../models/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const signup = async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
    role,
  }: { username: string; email: string; password: string; role: UserRole } =
    req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = new User({ username, email, password, role: role || 'House-hunter' });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(201)
      .json({
        message: "User created successfully",
        accessToken: token,
        user: { id: user._id, username, email, role: user.role },
      });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error", error: error });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res
      .status(200)
      .json({
        message: "Sign in successful",
        accessToken: token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json({
      message: "All users",
      users: users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error });
  }
}