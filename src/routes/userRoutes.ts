import express from 'express'
import { signup, signin } from '../controllers/userController'

const userRoutes = express.Router()

userRoutes.post('api/v1/auth/signup', signup)
userRoutes.post('api/v1/auth/signin', signin)

export default userRoutes