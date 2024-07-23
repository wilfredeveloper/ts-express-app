// import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
require('dotenv').config();
// dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET! || "SYRoyXkwqCDYlpR4WHmErHxHkKB0oAJEVPFmmPnmENQ=";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET! || "04FehVpNKREApXeN3v/cRL+DXKClcScbNX9wmzBpE04=";

// console.log("ACCESS_TOKEN_SECRET", ACCESS_TOKEN_SECRET);
// console.log("REFRESH_TOKEN_SECRET", REFRESH_TOKEN_SECRET);

function verifyToken(token: string) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}

function verifyRefreshToken(token: string) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded);
            }
        });
    });
}

const  generateAccessToken = (userId: string): string => {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
}

const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

export { verifyToken, verifyRefreshToken, generateAccessToken, generateRefreshToken };