import { User, UserSession } from "../Models/Users.models.js";
import { OTPDatabase } from "../Models/OTP.models.js";
import JWT from "jsonwebtoken";


const loginuser = async (req, res) => {
    try {
        const { MobNo, Password, deviceId } = req.body;
        const userdata = await User.findOne({ MobNo: MobNo });
        if (!userdata) {
            return res.status(401).json({ message: "Invalid login credentials." });
        }

        const isMatch = await userdata.checkpassword(Password);
        if (isMatch) {
            const refreshtokenDevices = await UserSession.find({
                MobNo: MobNo,
                Active: true
            });


            let c_device = refreshtokenDevices.find(
                s => s.DeviceID === deviceId
            )
            if (refreshtokenDevices.length >= 3 && !c_device) {
                return res.status(403).json({
                    code: 'DEVICE_LIMIT_REACHED',
                    message: 'You are already logged in on 3 devices.'
                });
            }


            const refreshToken = await UserSession.generateRefreshToken({
                MobNo: MobNo,
                DeviceID: deviceId
            })



            if (!c_device) {
                let newRefreshSession = await UserSession.create({
                    MobNo: MobNo,
                    DeviceID: deviceId,
                    RefreshTokenHash: refreshToken,
                    Active: true
                })
            }
            else {
                c_device.RefreshTokenHash = refreshToken;
                await c_device.save();
            }

            const accesstoken = await userdata.generateAccessToken();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,        // true in production (HTTPS)
                sameSite: 'strict',  // or 'lax'
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            return res.status(200)
                .json({
                    message: "Login Success",
                    Usersdata: {
                        FirstName: userdata.FirstName,
                        LastName: userdata.LastName,
                        MobNo: userdata.MobNo,
                        AccessToken: accesstoken,
                    }
                });
        }
        else {
            return res.status(401).json({ message: "Invalid crediential" });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(401).json({ Message: err });
    }
}


const refreshAccessToken = async (req, res) => {
    try {
        let Refreshtoken = req.cookies.refreshToken;
        if (!Refreshtoken) {
            return res.status(401).json({ message: 'No refresh token' });
        }
        let decodedToken;
        try {
            decodedToken = JWT.verify(
                Refreshtoken,
                process.env.REFRESH_TOKEN_SEC
            );
        } catch (e) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        const userdata = await User.findOne({ MobNo: decodedToken.MobNo });
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
            return res.status(403).json({ Message: 'Invalid refresh token' });
        }


        const accesstoken = await userdata.generateAccessToken();
        const refreshToken = await UserSession.generateRefreshToken({
            MobNo: decodedToken.MobNo,
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
        return res.status(200).json({ AccessToken: accesstoken })
    }
    catch (err) {
        console.log(err);
        return res.status(401).json({ Message: err });
    }
}


const GetOTP = async (req, res) => {
    try {
        const { MobNo, Purpose } = req.body;
        let existingUser = await User.findOne({ MobNo: MobNo });
        if (Purpose == 'FORGOTPASS' && !existingUser) {
            return res.status(500).json({ Message: "User Not Found" });
        }

        if (Purpose == 'REGISTRATION' && existingUser) {
            return res.status(500).json({ Message: "User already exist" });
        }

        let existingotp = await OTPDatabase.findOne({ $and: [{ MobNo: MobNo }, { Purpose: Purpose }] });

        if (existingotp && existingotp.verified) {
            let deleteotp = await OTPDatabase.deleteOne({ _id: existingotp._id });
            existingotp = null;
        }
        let NewOTP = generateotp();

        if (existingotp) {
            if (existingotp.Resendattempts >= existingotp.ResendLimit) {
                return res.status(500).json({ Message: "Resend limit exceeded. Try later." });
            }
            const now = Date.now();
            if (existingotp.lastSentAt && now - existingotp.lastSentAt < 30 * 1000) {
                return res.status(429).json({ Message: "Please wait before resending OTP." });
            }
            existingotp.Resendattempts += 1;
            existingotp.HashedOTP = NewOTP;
            existingotp.lastSentAt = new Date();
            existingotp.expireAt = new Date(Date.now() + 5 * 60 * 1000);
            await existingotp.save();
            return res.status(201).json({ Message: "OTP has been Resend to " + existingotp.MobNo, OTP: NewOTP });
        }
        else {
            let saveOTP = await OTPDatabase.create({
                MobNo: MobNo,
                Purpose: Purpose,
                HashedOTP: NewOTP,
                expireAt: new Date(Date.now() + 5 * 60 * 1000),
                verified: false,
                lastSentAt: new Date()
            });
            return res.status(201).json({ Message: "OTP has been Send to " + saveOTP.MobNo, OTP: NewOTP });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ Message: err });
    }
}


const verifyOTP = async (req, res) => {
    try {
        const { firstName, lastName, MobNo, Password, Purpose, OTP } = req.body;
        let existingotp = await OTPDatabase.findOne({ $and: [{ MobNo: MobNo }, { Purpose: Purpose }] });
        if (!existingotp) {
            return res.status(401).json({ message: "Internal Server Error" });
        }
        const isMatch = await existingotp.verifyOTP(OTP);
        if (isMatch) {
            let deleteotp = await OTPDatabase.deleteOne({ _id: existingotp._id });
            if (Purpose == "FORGOTPASS") {
                return res.status(201).json({ Message: "OTP Verified" });
            }
            if (Purpose == "REGISTRATION") {
                const user = await User.create({
                    FirstName: firstName,
                    LastName: lastName,
                    MobNo: MobNo,
                    Password: Password
                })
                return res.status(201).json({ Message: "New User Created", _id: user._id });
            }
        }
        else {
            return res.status(401).json({ message: "Invalid OTP" });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ Message: err });
    }
}

const logout = async (req, res) => {
    try {
        const Refreshtoken = req.cookies.refreshToken;
        if (!Refreshtoken) {
            return res.status(401).json({ Message: "Invalid Session" });
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
            return res.status(401).json({ Message: "Invalid Session" });
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
        console.log(err);
        return res.status(500).json({ Message: err });
    }
}

function generateotp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
export { loginuser, GetOTP, verifyOTP, logout, refreshAccessToken }

