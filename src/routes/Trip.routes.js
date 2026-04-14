import express from "express";
import { Createtrip, GetTrips } from "../controllers/Trip.controller.js";

const triproutes = express.Router();

triproutes.use('/Createtrip', Createtrip);
triproutes.use('/GetTrips', GetTrips);


export default triproutes;