import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (roles.includes(decoded.role)) {
        req.user = decoded;
        next();
      } else {
        res.status(403).json({ message: "Access denied" });
      }
    } catch (error) {
      res.status(403).json({ message: "Invalid token" });
    }
  };
};
