import express from "express";
import {getallpostbyID} from "../controllers/UserPosts.controller.js"

const UserPostsRoutes = express.Router();

UserPostsRoutes.get("/getAllpost", getallpostbyID);

export default UserPostsRoutes;
