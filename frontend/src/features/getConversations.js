import api from "../api/axios.js"
export const getConversations=async ()=>{
    try{
        const {data}=await api.get("/api/chat/getConversation")
        return data
    }catch(err){
        console.log(err.response.data)
    }
}