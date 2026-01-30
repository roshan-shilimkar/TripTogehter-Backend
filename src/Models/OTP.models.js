import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";

const OTPSchema = new Schema({
    MobileNo: {
        type: String,
        required: true
    },
    Purpose: {
        type: String,
        required: true
    },
    HashedOTP: {
        type: String,
        required: true
    },
    expireAt: {
        type: Date,
        required: true,
        expires: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    Verifyattempts: {
        type: Number,
        default: 0
    },
    VerifyLimit: {
        type: Number,
        default: 3
    },
    Resendattempts: {
        type: Number,
        default: 0
    },
    ResendLimit: {
        type: Number,
        default: 3
    },
    lastSentAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });



OTPSchema.pre("save", async function (next) {
    try {
        if (!this.isModified("HashedOTP")) return next();
        const salt = await bcrypt.genSalt(10); // generate salt
        this.HashedOTP = await bcrypt.hash(this.HashedOTP, salt); // hash password
        next();
    } catch (err) {
        next(err);
    }
});

OTPSchema.methods.verifyOTP = async function (OTP) {
    return await bcrypt.compare(OTP, this.HashedOTP);
}

export const OTPDatabase = mongoose.model('OTPMOdel', OTPSchema, 'OTP')