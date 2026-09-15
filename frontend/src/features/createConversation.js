import api from "../api/axios.js"
export const createConversation=async ()=>{
    try{
        const {data}=await api.post("/api/chat/createConversation")
        return data
    }catch(err){
        console.log(err.response.data)
    }
}