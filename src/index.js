
// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/DB.js";
import app from "./app.js";
dotenv.config(
    {
        path:'./env'
    }
)
connectDB()
.then(()=>{
// to handle error
app.on("error",(err)=>{
  console.log("Error connecting to Mongo",err)
  throw err

})

  app.listen(process.env.PORT || 9000 , ()=>{
    console.log(`server is running at ${process.env.PORT}`)
  })
})
.catch((err)=>{
  console.log("Failed to connect with MongoDb",err)

})









// This is first Approch to connect DB
/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import {express} from "express";

const app= express()

// IFEE function Imeediate Invoked Functions
;(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on((err)=>{
        console.error('Error connecting to MongoDB:', err);
        throw err;
    })

    app.listen(process.env.PORT,()=>{
        console.log(`appis running on server ${process.env.PORT}`);
        
    })
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
})();
*/