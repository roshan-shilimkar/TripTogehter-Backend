import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URl)
        console.log("Database Connected");
    }
    catch (err) {
        console.log("Database Connection Failed",err);
        process.exit(1);

    }
}
export default connectDb