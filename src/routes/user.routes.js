import { Router } from "express";
import {
  changeCurrentpassword,
  getCurrentUser,
  getWatchHistory,
  loginUser,
  logoutuser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

router.route("/logout").post(isLoggedIn, logoutuser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(isLoggedIn, changeCurrentpassword);

router.route("/current-user").get(isLoggedIn, getCurrentUser);

router.route("/update-account-details").patch(updateAccountDetails);

router
  .route("/update-avatar")
  .patch(isLoggedIn, upload.single("avatar"), updateAvatar);

router
  .route("/update-coverImage")
  .patch(isLoggedIn, upload.single("coverImage"), updateCoverImage);

///c/:username used to get current user details
router.route("/c/:username").get(isLoggedIn, getCurrentUser);

router.route("/watch-history").get(isLoggedIn, getWatchHistory);

export default router;
