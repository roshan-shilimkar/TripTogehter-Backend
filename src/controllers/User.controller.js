import { User, UserSession } from "../Models/Users.models.js";
import { OTPDatabase } from "../Models/OTP.models.js";
import JWT from "jsonwebtoken";
import crypto from 'crypto';
import { ErrorResponse, SuccessResponse } from "./Response.js";


const loginuser = async (req, res) => {
    try {
        const { MobileNo, Password, deviceId } = req.body;
        const userdata = await User.findOne({ MobileNo: MobileNo });
        if (!userdata) {
            return ErrorResponse(res, 401, "Invalid login credentials.");
        }

        const isMatch = await userdata.checkpassword(Password);
        if (isMatch) {
            const refreshtokenDevices = await UserSession.find({
                MobileNo: MobileNo,
                Active: true
            });


            let c_device = refreshtokenDevices.find(
                s => s.DeviceID === deviceId
            )


            const refreshToken = await UserSession.generateRefreshToken({
                MobileNo: MobileNo,
                DeviceID: deviceId
            })

            let HashRefrToken = crypto
                .createHash('sha256')
                .update(refreshToken)
                .digest('hex');


            // c_device will be true when user try to login from same device
            if (!c_device) {
                // if c_device false
                let newRefreshSession = await UserSession.create({
                    MobileNo: MobileNo,
                    DeviceID: deviceId,
                    RefreshTokenHash: HashRefrToken,
                    Active: true,
                    LoginAt: Date.now()
                });

                await UserSession.updateOne(
                    { _id: refreshtokenDevices._id },
                    { $set: { Active: false, LogoutAt: Date.now() } }
                );

            }
            else {
                c_device.RefreshTokenHash = refreshToken;
                c_device.LoginAt = Date.now();
                await c_device.save();
            }

            const accesstoken = await userdata.generateAccessToken();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,        // true in production (HTTPS)
                sameSite: 'strict',  // or 'lax'
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return SuccessResponse(res, 200, {
                FirstName: userdata.FirstName,
                LastName: userdata.LastName,
                MobileNo: userdata.MobileNo,
                AccessToken: accesstoken,
            })
        }
        else {
            return ErrorResponse(res, 401, "Invalid crediential");
        }
    }
    catch (err) {
        return ErrorResponse(res, 401, err);
    }
}


const refreshAccessToken = async (req, res) => {
    try {
        let Refreshtoken = req?.cookies?.refreshToken;
        if (!Refreshtoken) {
            return ErrorResponse(res, 401, "No refresh token");
        }
        let decodedToken;
        try {
            decodedToken = JWT.verify(
                Refreshtoken,
                process.env.REFRESH_TOKEN_SEC
            );
        } catch (e) {
            return ErrorResponse(res, 403, 'Invalid refresh token');

        }
        const userdata = await User.findOne({ MobileNo: decodedToken.MobileNo });
        let HashIncomingRefrToken = crypto
            .createHash('sha256')
            .update(Refreshtoken)
            .digest('hex');

        const refreshtokendb = await UserSession.findOne({
            RefreshTokenHash: HashIncomingRefrToken,
            DeviceID: decodedToken.DeviceID,
            Active: true
        })

        if (!refreshtokendb) {
            return ErrorResponse(res, 403, 'Invalid refresh token');
        }


        const accesstoken = await userdata.generateAccessToken();
        const refreshToken = await UserSession.generateRefreshToken({
            MobileNo: decodedToken.MobileNo,
            DeviceID: decodedToken.DeviceID
        })

        refreshtokendb.RefreshTokenHash = refreshToken;
        await refreshtokendb.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,        // true in production (HTTPS)
            sameSite: 'strict',  // or 'lax'
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        return SuccessResponse(res, 200, accesstoken);
    }
    catch (err) {
        return ErrorResponse(res, 401, err);

    }
}


const GetOTP = async (req, res) => {
    try {
        const { MobileNo, Purpose } = req.body;
        let existingUser = await User.findOne({ MobileNo: MobileNo });
        if (Purpose == 'FORGOTPASS' && !existingUser) {
            return ErrorResponse(res, 500, "User Not Found");
        }

        if (Purpose == 'REGISTRATION' && existingUser) {
            return ErrorResponse(res, 500, "User already exist");
        }

        let existingotp = await OTPDatabase.findOne({ $and: [{ MobileNo: MobileNo }, { Purpose: Purpose }] });

        if (existingotp && existingotp.verified) {
            let deleteotp = await OTPDatabase.deleteOne({ _id: existingotp._id });
            existingotp = null;
        }
        let NewOTP = generateotp();

        if (existingotp) {
            if (existingotp.Resendattempts >= existingotp.ResendLimit) {
                return ErrorResponse(res, 500, "Resend limit exceeded. Try later.");
            }
            const now = Date.now();
            if (existingotp.lastSentAt && now - existingotp.lastSentAt < 30 * 1000) {
                return ErrorResponse(res, 429, "Please wait before resending OTP.");
            }
            existingotp.Resendattempts += 1;
            existingotp.HashedOTP = NewOTP;
            existingotp.lastSentAt = new Date();
            existingotp.expireAt = new Date(Date.now() + 5 * 60 * 1000);
            await existingotp.save();
            return SuccessResponse(res, 201, NewOTP, true, "OTP has been Resend to " + existingotp.MobileNo);
        }
        else {
            let saveOTP = await OTPDatabase.create({
                MobileNo: MobileNo,
                Purpose: Purpose,
                HashedOTP: NewOTP,
                expireAt: new Date(Date.now() + 5 * 60 * 1000),
                verified: false,
                lastSentAt: new Date()
            });
            return SuccessResponse(res, 201, NewOTP, true, "OTP has been send to " + saveOTP.MobileNo);
        }
    }
    catch (err) {
        return ErrorResponse(res, 500, err);
    }
}


const verifyOTP = async (req, res) => {
    try {
        const { firstName, lastName, MobileNo, Password, Purpose, OTP } = req.body;
        console.log( firstName, lastName, MobileNo, Password, Purpose, OTP);
        let existingotp = await OTPDatabase.findOne({ $and: [{ MobileNo: MobileNo }, { Purpose: Purpose }] });
        console.log("come here 0"); 
        console.log("existingotp = ",existingotp);
        if (!existingotp) {
            return ErrorResponse(res, 401, "Internal Server Error");
        }

        console.log("come here 1 ");
        const isMatch = await existingotp.verifyOTP(OTP);
        if (isMatch) {
            let deleteotp = await OTPDatabase.deleteOne({ _id: existingotp._id });
            if (Purpose == "FORGOTPASS") {
                return SuccessResponse(res, 200);
            }
            else if (Purpose == "REGISTRATION") {
                const user = await User.create({
                    FirstName: firstName,
                    LastName: lastName,
                    MobileNo: MobileNo,
                    Password: Password
                });
                return SuccessResponse(res, 201, '', true, "Signedup Successfully.")
            }
        }
        else {
            return ErrorResponse(res, 401, "Invalid OTP.");

        }
    }
    catch (err) {
        return ErrorResponse(res, 500, err);
    }
}

const ChangePassword = async (req, res) => {
    try {
        const { MobileNo, Password } = req.body;
        let Userdata = await User.findOne({ MobileNo: MobileNo });
        if (Userdata) {
            Userdata.Password = Password;
            Userdata.save();
            return SuccessResponse(res, 200, '', true, "Password Change Successfully.");
        }
    }
    catch (err) {
        return ErrorResponse(res, 500, err);
    }

}


const logout = async (req, res) => {
    try {
        const Refreshtoken = req.cookies.refreshToken;
        if (!Refreshtoken) {
            return ErrorResponse(res, 401, "Invalid Session.");
        }
        let HashIncomingRefrToken = crypto
            .createHash('sha256')
            .update(Refreshtoken)
            .digest('hex');

        const refreshtokendb = await UserSession.findOne({
            RefreshTokenHash: HashIncomingRefrToken,
            Active: true
        });
        if (!refreshtokendb) {
            return ErrorResponse(res, 401, "Invalid Session.");

        }
        await UserSession.updateOne(
            { _id: refreshtokendb._id },
            { $set: { Active: false } }
        );
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (err) {
        return ErrorResponse(res, 500, err);
    }
}

function generateotp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export { loginuser, GetOTP, verifyOTP, logout, refreshAccessToken, ChangePassword }

