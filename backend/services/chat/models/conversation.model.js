import mongoose from "mongoose";

const conversationScheme = new mongoose.Schema({
    title:{
        type:String,
        default:"New Chat",
        required:true
    },
    userId:{
        type:String
    }
},{
    timestamps:true
})

const Conversation = mongoose.model("Conversation",conversationScheme);
export default Conversation;