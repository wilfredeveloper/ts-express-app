import express from 'express';
import { getAllUsers, rehydrateToken, resetPassword, sendResetPassord, signin, signup, verifyResetToken } from '../controllers/userController';
import rbacMiddleware from '../middleware/rbacMiddleware';

const userRoutes = express.Router()

userRoutes.get('/api/v1/users', rbacMiddleware(['Super Admin']), getAllUsers);
userRoutes.post('/api/v1/auth/signup', signup);
userRoutes.post('/api/v1/auth/signin', signin);
userRoutes.post(`/api/v1/auth/rehydrate-token`, rehydrateToken);
userRoutes.post(`/forgot-password`, sendResetPassord);
userRoutes.post('verify-reset-token', verifyResetToken);
userRoutes.post(`/reset-password/:token`, resetPassword);

export default userRoutes