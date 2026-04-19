import jwt from "jsonwebtoken";
import { User } from "../Models/Users.models.js"
import { ErrorResponse } from "../controllers/Response.js";


export const Authmiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return ErrorResponse(res, 400, "Invalid tokens.");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SEC);
        const user = await User.findOne({ _id: decodedToken._id, MobileNo: decodedToken.MobileNo });
        if (!user) {
            return ErrorResponse(res, 400, "Invalid tokens.");
        }


        req.userData = user;
        req.token = token;
        next();
    }
    catch (err) {
        if (err.name === "TokenExpiredError") {
            return ErrorResponse(res, 401, "Token expired.", "TOKEN_EXPIRED");
        } else {
            return ErrorResponse(res, 401, "Authentication failed :" + err.message,);
        }
    }
} 