import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Auth service is conneted to db");
    }catch(error){
        console.log("error connecting to Db:",error);
    }
};

export default connectDb;