import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,

    // frontend will send token or session id to accept that
    credentials: true,
  }),
);

// when user submit form data we will set limit because sometimes server craseh due to large data
app.use(express.json({ limit: "20kb" }));

app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";

// routes declaration
// use is a middleware we use it because now our controller and route files are sperate
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
export default app;
