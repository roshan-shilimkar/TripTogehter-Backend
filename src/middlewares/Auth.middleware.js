import jwt from "jsonwebtoken";
import { User } from "../Models/Users.models.js"


export const Authmiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        console.log("Token = ",token);
        if (!token) {
            return res.status(400).json({
                Message: "Invalid tokens no tokes provide"
            })
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SEC);
        console.log("decodedToken",decodedToken);
        const user = await User.findOne({ _id: decodedToken._id, MobileNo: decodedToken.MobileNo });
        console.log("user",user);
        if (!user) {
            return res.status(400).json({
                Message: "Invalid tokens and user"
            });
        }

        console.log("User from middleware = ",user);
        req.body.userData = user;
        req.token = token;
        next();
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        } else {
            return res.status(401).json({ message: "Authentication failed", error: err.message });
        }
    }
} 