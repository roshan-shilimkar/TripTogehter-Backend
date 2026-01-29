import express from "express";
import { checkHealth } from "../controllers/HealthCheck.controller.js";

const router = express.Router();

router.get("/",checkHealth);


export default router

