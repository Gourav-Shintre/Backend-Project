import mongoose , {Schema} from "mongoose";
import  jwt  from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema = new Schema({
  username : {
    type : String,
    required : true,
    unique : true,
    lowercase : true,
    trim : true,
    //  for searching purpose it will search for this username in db
    index : true  
  },
  email : {
    type : String,
    required : true,
    unique : true,
    lowercase : true,
    trim : true,
  },
  fullName :{
    type : String,
    required : true,
    unique : true,
    trim : true,
    index:true

  },
  avatar :{
    type : String,//cloudnay url
    required : true,

  },
  coverImage :{
    type:String ,//cloudnay url
  },
  watchHistory : [
    {
    type : Schema.Types.ObjectId,
    ref : "Video",
    }
  ],
  password : {
    type : String,
    required : [true,"Password is required"],

  },
  refreshToken : {
    type : String
  },
  timestamps: true, // it will create createdAt and updatedAt field in db


})

// we dont write arrow function in pre save hook because we need to access this keyword which is pointing to the userSchema object
userSchema.pre("save",async function (next) {
  if(!this.Modified("password")) return next()


// 🔐 What is 10?
// It's the number of "salt rounds" — basically how many times bcrypt scrambles the password during hashing.

// Why does that matter?
// More salt rounds = 🔒 stronger security
// But also = 🐢 slower hashing (on purpose, to make brute-force attacks harder)

  this.password=bcrypt.hash(this.password,10)
  next()
})

// to compare the password with the hashed password in db
userSchema.methods.comparePassword= async function (password){
  // it give boolean value
 return await bcrypt.compare(password,this.password)

}

// to crete the jwt token
userSchema.methods.creteAccessToken = function (){
  return jwt.sign({
   _id : this._id,
   username: this.username,
   email:this.email,
   fullName : this.fullName
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn : process.env.ACCESS_TOKEN_EXPIRY
  }
)
}

userSchema.methods.createrefreshToken = function (){
  return jwt.sign(
    {
    _id : this._id,
    username: this.username,
    email:this.email,
    fullName : this.fullName
   },
   process.env.REFRESH_TOKEN_SECRET,
   {
     expiresIn : process.env.REFRESH_TOKEN_EXPIRY
   }
 )
}


export const User = mongoose.model("User",userSchema) 