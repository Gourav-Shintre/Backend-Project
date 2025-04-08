
// require('dotenv').config({path:'./env'})
import dotenv from "dotenv"
import connectDB from "./db/DB.js";

dotenv.config(
    {
        path:'./env'
    }
)

connectDB()











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