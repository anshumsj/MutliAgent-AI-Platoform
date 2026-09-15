import { graph } from "../graph/graph.js";
import axios from "axios"
export const agent = async(req,res)=>{
    try{
        const {prompt,conversationId}=req.body
        await axios.post(`${process.env.CHAT_SERVICE}/saveMessage`,{
            conversationId,role:"user",content:prompt
        })
        const result = await graph.invoke({
            prompt,
            conversationId
        })
        const response = result.aiResponse
        return res.status(200).json({
            success:true,
            message:"Agent response",
            data:response
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Something went wrong",
            error:error.message
        })
    }
} 