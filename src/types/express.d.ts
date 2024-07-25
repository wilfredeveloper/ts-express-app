import type { User } from "../models/User";
declare global {
  namespace Express {
    interface Request {
      user?: User; // Adjust the type as per your JWT payload structure
    }
  }
}
