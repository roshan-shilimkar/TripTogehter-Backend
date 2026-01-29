// import { userpost } from "../Models/Posts.models.js";

// const getallpostbyID = async (req, res) => {

    
//     console.log("getallpost api called")
//     const result = 
//          await userpost.aggregate([
//             {
//                 $match: {
//                     userId: "user2"
//                 }
//             },
//             {
//                 $sort: {
//                     createdAt: -1
//                 }
//             },
//             {
//                 $limit: 10
//             }
//         ]);

//     return res.status(200).json({
//         message: "THis is your data for now",
//         Posts: result
//     })
// }

// export { getallpostbyID }