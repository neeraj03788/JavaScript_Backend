import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



const generateAccessAndRefreshTokens= async(userId)=>{
    try {
        const user=await User.findById(userId);
        // console.log("user",user.generateAccessToken());
        const accessToken=user.generateAccessToken();
        // console.log("ACCESSTOKEN",accessToken);
        const refreshToken=user.generateRefreshToken();

        
        user.refreshToken=refreshToken;
       
        await user.save({validateBeforeSave: false});
        
        return { accessToken, refreshToken }
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refrresh token and access token")
    }
}

const registerUser= asyncHandler(async(req,res)=>{
   // get user details from frontend
   // validation - not empty
   // check if user already exist: username , email
   // check for images, check for avatar
   // upload them to cloudinary, avatar
   // create user object - create entry in db 
   // remove password and refresh token field from response
   // check for user creation
   // return res


   const {fullName,email,username,password}=req.body;


  // check fields are empty or not
    if(
        [fullName,email,username,password].some((field)=>field?.trim()==="")
    ){
     throw new ApiError(400,"All fields are required")
    }
  
    //existence check
    const existedUser=await User.findOne({
        $or:[{email},{username}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username exists")
    }
    // console.log(req.files)
    //check images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar file is required")
    }
    
    //upload on cloudinary
   const avatar=await uploadOnCloudinary(avatarLocalPath);
   const coverImage=await uploadOnCloudinary(coverImageLocalPath)
   
   if(!avatar){
    throw new ApiError(400,"Avatar file is required")
   }
   

  // creating user
   const user=await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username.toLowerCase()
   })

   const createdUser=await User.findById(user._id).select(
    "-password -refreshToken" 
   )
   if(!createdUser){
    throw new ApiError(500,"Something went wrong while regresting the user")
   }

   return res.status(201).json(
    new ApiResponse(200,createdUser,"user registered successfully")
   )
})

const loginUser = asyncHandler(async(req,res)=>{
    //req body ->data
    // username or email based login
    // username find
    // password check
    // refresh token access token
    // send cookie
    // return res

    const {username,email,password}=req.body;
    if(!username && !email){
        throw new ApiError(400,"username and email is required")
    }
   
    const user = await User.findOne({
            $or:[{email},{username}]
        })
    
    if(!user){
        throw new ApiError(404,"User doesn't exist")
    }
 
    const isPasswordValid=await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Wrong credentials")
    }
    
    // console.log("user id",user._id)
    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id);
    // console.log("access in user contoller",accessToken)
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true,
    }
    
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken,refreshToken
                
            },
            "user Logged In seccessfully"
        )
    )


    })


const logoutUser=asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
           $unset:{
            refreshToken: 1 //this removes the field from document
           }
        },
        {
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true,
    }
    return res.
    status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const IncomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!IncomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    try {
        const decodeToken = jwt.verify(IncomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        if(IncomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
     
        const {accessToken,newrefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(200,{accessToken,newrefreshToken},"refreshed AccessToken")
            )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword,confirmPassword} =req.body;

    const user= await User.findById(
        req.user._id)
        
})


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken


}