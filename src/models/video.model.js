import mongoose , {Schema} from "mongoose";

const userSchema = new Schema({
  username : {
    type : String,
    required : true,
    unique : true,
    lowercase : true,
    trim : true,
    //  for searching purpose it will search for this username in db
    index : true  
  }


})


export const User = mongoose.model("User",userSchema) 