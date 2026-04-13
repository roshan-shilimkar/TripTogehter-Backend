import express from "express";
import { verifyOTP, loginuser, GetOTP, ChangePassword,refreshAccessToken, logout } from "../controllers/User.controller.js"

const userroutes = express.Router();

// userroutes.post("/register", registeruser);
userroutes.post("/Login", loginuser);
userroutes.post("/genOtp", GetOTP);
userroutes.post("/Verifyotp", verifyOTP);
userroutes.post("/Changepass", ChangePassword);
userroutes.post("/RefreshAccessToken",refreshAccessToken);
userroutes.post("/Logout",logout);


export default userroutes;