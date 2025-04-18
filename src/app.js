import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app=express();

app.use(cors({
  origin : process.env.CORS_ORIGIN,

  // frontend will send token or session id to accept that 
  credentials:true
}))

// when user submit form data we will set limit because sometimes server craseh due to large data
app.use(express.json(),{limit:"20kb"})


app.use(cookieParser())

export default app;