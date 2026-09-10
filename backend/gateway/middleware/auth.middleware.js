import redis from "../../shared/redis/redis.js"

const protect= async (req,res,next)=>{
    try{
        const sessionId=req.cookies?.session
        if(!sessionId){
            return res.status(400).json({success:false,message:"unauthorized"})
        }
        const userSession = await redis.get(`session:${sessionId}`);
        if(!userSession){
            return res.status(400).json({success:false,message:"sesion expired"});
        }
        req.user=JSON.parse(userSession)
        next();
    }
    catch(error){
        console.log("auth middleware error",error.code);
        console.log("auth middleware error message",error.message);
        return res.status(500).json({success:false,message:"auth middleware error"});
    }
}


export default protect;