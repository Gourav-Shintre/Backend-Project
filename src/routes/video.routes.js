import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import { getVideoById, uploadVideo } from "../controllers/video.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

// video

router.route("/upload-video").post(
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name : "thumbNail",
      maxCount : 1
    }
  ]),
  isLoggedIn,
  uploadVideo,
);


router.route('/:videoId').get(isLoggedIn,getVideoById);

export default router;
