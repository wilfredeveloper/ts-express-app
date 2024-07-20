import { Request, Response } from "express";
import User, { UserRole } from "../models/User";
import dotenv from "dotenv"
import { generateAccessToken, generateRefreshToken } from "../utils/jwtUtils";
import { User as UserType } from "../types/user";

dotenv.config();

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

    const accessToken = generateAccessToken(user._id);

    res
      .status(201)
      .json({
        message: "User created successfully",
        accessToken: accessToken,
        user: { id: user._id, username, email, role: user.role },
      });
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Server error", error: error });
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

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);


    res
      .status(200)
      .json({
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
    return res.status(500).json({ message: "Server error", error: error });
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
    return res.status(500).json({ message: "Server error", error: error });
  }
}