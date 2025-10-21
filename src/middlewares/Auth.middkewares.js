import jwt from "jsonwebtoken";
import { User } from "../Models/Users.models.js"


export const Authmiddleware = async (req, res, next) => {
    try {

        console.log("come in authmiddleware");
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return res.status(400).json({
                Message: "Invalid tokens no tokes provide"
            })
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SEC);
        console.log("decodedToken", decodedToken);

        const user = await User.findOne({ _id: decodedToken._id, "AuthTokens.token": token })


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
            return res.status(401).json({ message: "Token expired, please log in again" });
        } else {
            return res.status(401).json({ message: "Authentication failed", error: err.message });
        }
    }
} 