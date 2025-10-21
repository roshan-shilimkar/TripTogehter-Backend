import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URl)
        console.log("Database Connected");
    }
    catch (err) {
        console.err("Database Connection Failed");
        process.exit(1);

    }
}
export default connectDb