import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";
import { type } from "os";
import crypto from "crypto";

const Users = new Schema({
    FirstName: {
        type: String,
        required: true,
        trim: true,
    },
    LastName: {
        type: String,
        required: true,
        trim: true,
    },
    MobNo: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
})

const User_sessions = new Schema({
    MobNo: {
        type: String,
        required: true
    },
    DeviceID: {
        type: String,
        required: true,
    },
    RefreshTokenHash: {
        type: String,
        required: true,
        unique: true
    },
    Active: {
        type: Boolean,
        required: true,
    }
})

Users.pre("save", async function (next) {
    try {
        if (!this.isModified("Password")) return next();
        const salt = await bcrypt.genSalt(10); // generate salt
        this.Password = await bcrypt.hash(this.Password, salt); // hash password
        next();
    } catch (err) {
        next(err);
    }
});

User_sessions.pre("save", async function (next) {
    try {
        if (!this.isModified("RefreshTokenHash")) return next();
        this.RefreshTokenHash= crypto
            .createHash('sha256')
            .update(this.RefreshTokenHash)
            .digest('hex');
        next();
    } catch (err) {
        next(err);
    }
});


Users.methods.checkpassword = async function (Password) {
    return await bcrypt.compare(Password, this.Password);
}



Users.methods.generateAccessToken = function () {
    return JWT.sign({
        _id: this._id,
        MobNo: this.MobNo,
    },
        process.env.ACCESS_TOKEN_SEC,
        { expiresIn: process.env.ACCESS_TOKEN_EXP });
}



User_sessions.statics.generateRefreshToken = function (payload) {
    return JWT.sign(payload,
        process.env.REFRESH_TOKEN_SEC,
        { expiresIn: process.env.REFRESH_TOKEN_EXP })
}



export const User = mongoose.model("Users", Users)
export const UserSession = mongoose.model("User_Session", User_sessions)


