import express from "express";
import { Createtrip } from "../controllers/Trip.controller.js";

const triproutes = express.Router();

triproutes.use('/Createtrip',Createtrip)

export default triproutes;