import jwt from "jsonwebtoken";
import { User } from "../Models/Users.models.js"


export const Authmiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({
                Message: "Invalid tokens no tokes provide"
            })
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SEC);
        const user = await User.findOne({ _id: decodedToken._id, MobNo: token.MobNo })
        if (!user) {
            return res.status(400).json({
                Message: "Invalid tokens and user"
            });
        }

        req.user = user; 
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