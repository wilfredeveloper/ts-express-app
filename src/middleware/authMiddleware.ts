/// <reference path="../types/express.d.ts" />

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';

// Middleware to check authentication
export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies['next-auth.session-token'] || null;

    if (token == null) {
        return res.redirect("/auth/signin");
    }

    try {
        const decoded = await verifyToken(token);

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
