require("dotenv").config();
import { Request, Response } from "express";
import { Resend } from "resend";
import User, { UserRole } from "../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwtUtils";

interface DecodedToken {
  userId: string;
  role: UserRole;
}

const RESENDAPIKEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESENDAPIKEY);

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
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      message: "User created successfully",
      accessToken: accessToken,
      refreshToken: refreshToken,
      user: { id: user._id, username, email, role: user.role },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ ServerError: "Server error", error: error });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const reqToken = await req.headers.authorization;
  console.log("Req Token: ", reqToken);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "No user found using that email address" });
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
    const decoded = (await verifyRefreshToken(
      refreshToken as string
    )) as DecodedToken;
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

export const sendResetPassord = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("User with this email does not exist");
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit token

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1Hr

    await user.save();

    const { data, error } = await resend.emails.send({
      from: "admin@wilfredeveloper.me",
      to: email,
      subject: "Homeseek - Password reset",
      html: `Your Password reset token is: ${token}`,
    });

    if (error) {
      return res.status(400).json({
        message: "Could not send email",
        error,
      });
    }

    res.status(200).json({
      message: `Reset Password Email sent to ${email}. Check your inbox`,
      data,
    });
  } catch (error) {
    res.status(500).send({
      serverError: "Server Error",
      error
    })
  }
};

export const verifyResetToken = async (req: Request, res: Response) => {
  const { email, token } = req.body;

  try {
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).send({
        message: "Password reset token is invalid or has expired"
      });
    }

    res.status(200).send({
      message: "Token validaton successfull"
    });
  } catch (error) {
    res.status(500).send({
      serverError: "Server error",
      error
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const token = req.params.token;

  try {
    const user = await User.findOne({
      email,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).send({
        message: "Password reset token is invalid or has expired"
      });
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.password = password;

    await user.save();

    res.status(200).send({
      message: "Password reset successful"
    });
  } catch (error) {
    res.status(500).send({
      serverError: "Server error",
      error
    });
  }
};