import express from "express";
import dotenv from "dotenv";
import CORS from "cors";
import connectDb from "./db/db.js";
// import router from "./routes/HealthCheck.routes.js";
import userroutes from "./routes/user.routes.js";
// import UserPostsRoutes from "./routes/userpost.routes.js";
import {Authmiddleware} from "./middlewares/Auth.middkewares.js"


dotenv.config({
    path: "./.env"
})

const app = express();
const PORT = process.env.PORT || "8000";

// Database Connection
connectDb().then(() => {
    console.error("MongoDb Connected")
}).catch((err) => {
    console.error("MongoDb Not Connected" + err)
})


// Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(CORS(
    {
        origin: "http://localhost:8100",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH",]
    }))


// Rs
// app.use("/api/healthcheckup", router);

app.use("/api/user", userroutes);

// app.use("/api/post",Authmiddleware, UserPostsRoutes);

app.listen(PORT, () => {
    console.log("app is listing on port :" + PORT)
})
