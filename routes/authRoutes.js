import express from "express"
import { userRegister } from "../controllers/authController.js";

const authRoutes = express.Router();

// authRoutes.post("/login",userLogin);

authRoutes.post("/register",userRegister);

export default authRoutes ;