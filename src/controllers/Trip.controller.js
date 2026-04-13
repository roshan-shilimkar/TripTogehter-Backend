import { tripmodel } from '../Models/Trip.models.js';

const Createtrip = async (req, res) => {
    try {
        console.log("Come in Create Trip");

        const { tripGroupName, tripGroupDesc, tripstartDate, tripendDate, userData } = req.body;
        console.log(tripGroupName, tripGroupDesc, tripstartDate, tripendDate, userData);

        const tripgrp = await tripmodel.create({
            GroupName: tripGroupName,
            GroupDesc: tripGroupDesc,
            Members: [{
                UserId: userData._id,
                Role: 1
            }],
            StartDate: tripstartDate,
            EndDate: tripendDate,
        });
        return res.status(200).json({ Message: "Group Created Successfully." })
    }
    catch (err) {
        return res.status(500).json({
            Message: err
        })
    }
}

export { Createtrip }