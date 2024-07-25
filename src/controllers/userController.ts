import dotenv from "dotenv";
import { Request, Response } from "express";
import User, { UserRole } from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils";

dotenv.config();

interface DecodedToken {
  userId: string;
  role: UserRole;
}

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
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = new User({
      username,
      email,
      password,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: role || "House-hunter",
    });
    await user.save();

    const accessToken = generateAccessToken(user._id);

    res.status(201).json({
      message: "User created successfully",
      accessToken: accessToken,
      user: { id: user._id, username, email, role: user.role },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ServerError: "Server error", error: error });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const reqToken = await req.headers.authorization
  console.log("Req Token: ", reqToken)

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "No user found using that email address" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    if (!accessToken || !refreshToken) {
      return res.status(500).json({ error: "Unable to generate Tokens" });
    }

    res.status(200).json({
      message: "Sign in successful",
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ ServerError: "Server error", error });
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
    return res.status(500).json({ ServerError: "Server error", error: error });
  }
};

export const rehydrateToken = async (req: Request, res: Response) => {

  const { refreshToken } = req.query;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const decoded = await verifyRefreshToken(refreshToken as string) as DecodedToken;
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    if (!accessToken || !newRefreshToken) {
      return res.status(500).json({ message: "Unable to generate Tokens" });
    }

    res.status(200).json({
      message: "Token rehydrated",
      accessToken: accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ ServerError: "Server error", error });
  }
};
