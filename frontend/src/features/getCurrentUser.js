import api from "../../utils/axios"
export const getCurrentUser=async()=>{
    try{
        const {data}=await api.get("/api/me");
        console.log("current user",data);
    }catch(error){
        console.log("error",error);
    }
}