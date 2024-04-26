import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";



const verifyJWT= asyncHandler(async(req,_,next)=>{ 
    // res have no use so defined with _
    try {
        // console.log("req.cookies",req.cookies);
        // console.log("req.cookies.accessToken",req.cookies.accessToken);
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if(!token){
            throw new ApiError(401,"unAAauthorized request")
        }
        // console.log("Access Token",process.env.ACCESS_TOKEN_SECRET)
        
        // console.log("TOKEN,",token)
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        
        const user = await  User.findById(decodedToken?._id).select("-password -refreshToken")
    
       if(!user){
        //TODO: frontend use
        throw new ApiError(401,"Invalid Access Token")
       }
       req.user = user;
       next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access Token" )
    }
})

export {verifyJWT}