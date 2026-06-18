import express from "express"

const authRoutes = express.Router();

authRoutes.post("/login",userLogin);

authRoutes.post("register",userRegister);

export default authRoutes ;