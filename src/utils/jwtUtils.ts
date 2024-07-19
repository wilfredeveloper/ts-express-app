import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.AUTH_SECRET!;

export function verifyToken(token: string) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}
