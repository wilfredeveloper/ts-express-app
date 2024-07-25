/// <reference path="../types/express.d.ts" />

import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwtUtils';

// Middleware to check authentication
export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const adminToken = req.cookies['homeseek-admin'] || null;

    if (adminToken == null) {
        return res.status(401).json({ message: "Invalid credentials. Only admins are allowed to access this route"});
    }

    try {
        const decoded = await verifyToken(adminToken);

        if (decoded) {
            req.user = decoded;
            next();
        } else {
            res.clearCookie('next-auth.session-token');
            res.redirect("/auth/signin");
        }
    } catch (error) {
        res.clearCookie('next-auth.session-token');
        res.redirect("/auth/signin");
    }
}
