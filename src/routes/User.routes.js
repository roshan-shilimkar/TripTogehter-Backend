import express from "express";
import { registeruser, loginuser } from "../controllers/User.controller.js"

const userroutes = express.Router();

userroutes.post("/register", registeruser);
userroutes.post("/Login", loginuser);

export default userroutes;