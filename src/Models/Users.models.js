import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import JWT from "jsonwebtoken";

const Users = new Schema({
    FirstName: {
        type: String,
        require: true,
        trim: true,

    },
    LastName: {
        type: String,
        require: true,
        trim: true,
    },
    MobNo: {
        type: String,
        require: true,
        unique: true
    },
    Email: {
        type: String,
        // required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    role: {
        type: String,
        require: true,
    },
    Password: {
        type: String,
        required: true,
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    AuthTokens: [{
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    refreshtoken: {
        type: String,
    },
    ForgotPasswordToken: {
        type: String,
    },
    ForgotPasswordExpiry: {
        type: Date,
    },
    EmailVerificationToken: {
        type: String,
    },
    EmailVerificationExpiry: {
        type: Date,
    },
}, {
    timestamps: true
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

Users.methods.checkpassword = async function (Password) {
    return await bcrypt.compare(Password, this.Password);
}

Users.methods.generateAccessToken = async function () {
    console.log("come in statt");
    const tokens = await JWT.sign({
        _id: this._id,
        Username: this.Usernamem,
        email: this.email
    },
        process.env.ACCESS_TOKEN_SEC,
        { expiresIn: "1d" });

        console.log("tokens",tokens);
    this.AuthTokens.push({ token: tokens });
    await this.save();
    console.log("come in enddd");

    return tokens;
}

Users.methods.generateRefreshToken = async function () {
    return await JWT.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SEC,
        { expiresIn: process.env.REFRESH_TOKEN_EXP })
}

export const User = mongoose.model("Users", Users)

