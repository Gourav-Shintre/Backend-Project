import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadFileOnCloudnary} from "../utils/cloudnary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

// register user
const registerUser = asyncHandler(async(req,res)=>{

  // register user
  // get details from frontend
  // validation for all req. fields
  // check if user is already exist based on email/username
  // check for images and avatar
  // check image is uploaded on  cloudnary
  // create object enrty  create in db
  // remove password and refresh token from response
  // check fro user creation
  // send response

  // res.status(200).json({
  //   message : "ok"
  // })

  const {username,email,fullName,password}=req.body
  // console.log("email",email);
  // console.log("fullname",fullName);
  // console.log("username",username);
  // console.log("password",password);

  

  // check for validations
 if(
  [username,email,fullName,password].some((field)=>field?.trim()==="")
 ){
  throw new ApiError(400,"All field are required")
 }

//  check for existing user
 const existedUser =await User.findOne({
  $or : [{ username }, { email }]
 })

 if(existedUser){
  throw new ApiError(409,"User with this email or username already exist")
 }

//  console.log(existedUser , "existeing user");
 


//  check for images
// we use middleware in user.routes e.g. upload 
// multer gives u access of files


// we need first property of that file
const avatarLocalpath=req?.files?.avatar[0]?.path
// const files=req.files

// console.log(files.path,"file path avatar image");

// const coverImageLocalpath = req?.files?.coverImage[0]?.path
let coverImageLocalpath ;
if(req.files && (Array.isArray(req.files.coverImage)) && req.files.coverImage.length >0){
  coverImageLocalpath = req.files.coverImage[0].path

}




// validation for avatar image
if(!avatarLocalpath){
  throw new ApiError(400,"Avatar file is required")
}

// upload on cloudnary

 const avatar = await uploadFileOnCloudnary(avatarLocalpath)
 const coverImage = await uploadFileOnCloudnary(coverImageLocalpath)

 if(!avatar){
  throw new ApiError(400,"Avatar is required")
 }


//  create in db

const user = await User.create({
  fullName,
  avatar: avatar.url,
  coverImage : coverImage?.url ?? "",
  email,
  password,
  username: username.toLowerCase()

})

// console.log("Body:", req.body);



// select is a method which will remove this two fileds
const createdUser= await User.findById(user?._id).select(
  "-password -refreshToken"
)

if(!createdUser){
  throw new ApiError(500,"Something went wrong while regestring the user")
}

return res.status(201).json(
  
    new ApiResponse(200,createdUser,"user registered successfully")
  
)







})



export {registerUser}