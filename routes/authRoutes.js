import express from "express"
import { userRegister , userLogin } from "../controllers/authController.js";

const authRoutes = express.Router(); // initializes express router

authRoutes.post("/login",userLogin); // attaches controller to login route

authRoutes.post("/register",userRegister);  // attaches controller to register route

export default authRoutes ;