import express from "express";
import { Createtrip, GetTrips, checkMembers } from "../controllers/Trip.controller.js";

const triproutes = express.Router();

triproutes.use('/Createtrip', Createtrip);
triproutes.use('/GetTrips', GetTrips);
triproutes.use('/checkMembers', checkMembers);


export default triproutes;