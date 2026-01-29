import express from "express";
import { verifyOTP, loginuser, GetOTP } from "../controllers/User.controller.js"

const userroutes = express.Router();

// userroutes.post("/register", registeruser);
userroutes.post("/Login", loginuser);
userroutes.post("/genOtp", GetOTP);
userroutes.post("/Verifyotp", verifyOTP);

export default userroutes;