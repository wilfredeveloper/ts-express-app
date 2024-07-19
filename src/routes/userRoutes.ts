import express from 'express'
import { signup, signin, getAllUsers } from '../controllers/userController'

const userRoutes = express.Router()

userRoutes.get('/api/v1/users', getAllUsers)
userRoutes.post('/api/v1/auth/signup', signup)
userRoutes.post('/api/v1/auth/signin', signin)

export default userRoutes