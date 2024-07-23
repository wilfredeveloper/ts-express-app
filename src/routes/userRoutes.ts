import express from 'express'
import { signup, signin, getAllUsers, rehydrateToken } from '../controllers/userController'

const userRoutes = express.Router()

userRoutes.get('/api/v1/users', getAllUsers)
userRoutes.post('/api/v1/auth/signup', signup)
userRoutes.post('/api/v1/auth/signin', signin)
userRoutes.post('/api/v1/auth/rehydrate-token', rehydrateToken)

export default userRoutes