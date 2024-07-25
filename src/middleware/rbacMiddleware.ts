import { NextFunction, Request, Response } from 'express';
import User, { UserRole } from '../models/User';
import { verifyToken } from '../utils/jwtUtils';
interface DecodedToken {
  userId: string;
  role: UserRole;
}

const rbacMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Access token is required" });
    }

    try {
      const decoded = await verifyToken(token as string) as DecodedToken;

      const user = await User.findById(decoded.userId);

      if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }
      

      // req.user = user; // Attach user to request object for further use
      next();
    } catch (error) {
      return res.status(403).json({ message: "Access denied", error });
    }
  };
};

export default rbacMiddleware;
