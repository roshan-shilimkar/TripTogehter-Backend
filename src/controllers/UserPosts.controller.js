import { userpost } from "../Models/Posts.models.js";

const getallpostbyID = async (req, res) => {
    console.log("User from req = ", req.user);
    const result = 
         await userpost.aggregate([
            {
                $match: {
                    userId: "user2"
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $limit: 5
            }
        ]);

    console.log("result from posts:", result);

    return res.status(200).json({
        message: "THis is your data for now"
    })
}

export { getallpostbyID }