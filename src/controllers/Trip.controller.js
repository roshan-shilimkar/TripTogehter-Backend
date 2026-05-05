import { tripmodel } from '../Models/Trip.models.js';
import { User } from "../Models/Users.models.js";

import { ErrorResponse, SuccessResponse } from './Response.js';

const Createtrip = async (req, res) => {
    try {

        const { tripGroupName, tripGroupDesc, tripstartDate, tripendDate } = req.body;
        const userData = req.userData;


        const tripgrp = await tripmodel.create({
            GroupName: tripGroupName,
            GroupDesc: tripGroupDesc,
            Members: [{
                UserId: userData._id,
                UserName: userData.FirstName + ' ' + userData.LastName,
                AddedOn: Date.now(),
                Role: 1
            }],
            StartDate: tripstartDate,
            EndDate: tripendDate,
        });
        return SuccessResponse(res, 200, null, true, "Group Created Successfully.");
    }
    catch (err) {
        return ErrorResponse(res, 500, false, err);
    }
}


const checkMembers = async (req, res) => {
    try {


        const Users = await User.find({
            MobileNo: {
                $in: req.body.numbers
            }
        });

        const RegisteredNumbers = Users.map(user => user.MobileNo);
        const UnregisteredNumbers = req.body.numbers.filter(number => !RegisteredNumbers.includes(number));
        console.log("RegisteredNumbers", RegisteredNumbers);
        console.log("UnregisteredNumbers", UnregisteredNumbers);
        return SuccessResponse(res, 200, { RegisteredNumbers, UnregisteredNumbers });
    }
    catch (err) {
        return ErrorResponse(res, 500, false, err);
    }
}

const GetTrips = async (req, res) => {
    try {
        const userData = req.userData;
        const Trips = await tripmodel.find({
            "Members.UserId": userData._id
        });

        return SuccessResponse(res, 200, Trips);
    }
    catch (err) {
        return ErrorResponse(res, 500, false, err);
    }
}

export { Createtrip, GetTrips, checkMembers }