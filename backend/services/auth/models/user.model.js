import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firebaseUid:{
        type:String,
        unique:true,
        require:true
    },
    name:{
        type:String,
        require:true
    },
    email:{
        type:email,
        unique:true,
        require:true
    },
    avatar:{
        type:String
    }
},{
    timestamps:true
})

const User = mongoose.model("User",userSchema);
export default User;