import mongoose, { Schema } from "mongoose";



const Trip = new Schema({
    GroupName: {
        type: String,
        required: true
    },
    GroupDesc: {
        type: String,
        required: true
    },
    StartDate: {
        type: Date,
        required: true
    },
    EndDate: {
        type: Date,
        required: true
    },
    Members: [{
        UserId: {
            type: String,
            required: true
        },
        UserName: {
            type: String,
            required: true
        },
        AddedOn: {
            type: Date,
            required: true,
            default: Date.now
        },
        Role: {
            type: Number,
            required: true,
            default: 0,
        }
    }],
    CreateAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    ModifiedAt: {
        type: Date,
        required: true,
        default: Date.now
    },

});

export const tripmodel = mongoose.model("TripModel", Trip)