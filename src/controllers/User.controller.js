import { User } from "../Models/Users.models.js";

const registeruser = async (req, res) => {
    try {
        const { firstName, lastName, mobNo, Email, role, Password } = req.body;
        const existingUser = await User.findOne({ $or: [{ Email }, { MobNo: mobNo }] });
        if (existingUser) {
            return res.status(400).json({ Message: "User already exist" });
        }
        console.log("asdasdas", existingUser);

        const user = await User.create({
            FirstName: firstName,
            LastName: lastName,
            Email: Email,
            MobNo: mobNo,
            role: role,
            Password: Password
        })
        return res.status(201).json({ Message: "New User Created", _id: user._id });
    } catch (err) {
        console.log(err);
        return res.status(401).json({ Message: err });
    }
}

const loginuser = async (req, res) => {
    try {
        const { Userid, Password } = req.body;
        const userdata = await User.findOne({ $or: [{ Email: Userid }, { MobNo: Userid }] });
        if (!userdata) {
            return res.status(401).json({ message: "Incorrect User ID" });
        }

        const isMatch = await userdata.checkpassword(Password);
        console.log("isMatch", isMatch);
        if (isMatch) {
            const token = await userdata.generateAccessToken();
            console.log("password match", token);
            return res.status(200)
                .json({
                    message: "Login Success",
                    Usersdata: {
                        FirstName: userdata.FirstName,
                        LastName: userdata.LastName,
                        Email: userdata.Email,
                        MobNo: userdata.MobNo,
                        Role: userdata.role,
                        isEmailVerified: userdata.isEmailVerified,
                        authToken: token
                    }
                });
        }
        else {
            console.log("end loginuser");

            return res.status(401).json({ message: "Invalid crediential" });
        }

    }
    catch (err) {
        console.log(err);
        return res.status(401).json({ Message: err });
    }
}

export { registeruser, loginuser }