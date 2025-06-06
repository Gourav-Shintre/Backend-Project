import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadFileOnCloudnary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { validateHeaderName } from "http";
import { userInfo } from "os";
import mongoose from "mongoose";

// generate refrrsh and acess token
const generateRfreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.creteAccessToken();
    const refreshToken = user.createrefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token",
    );
  }
};

// register user
const registerUser = asyncHandler(async (req, res) => {
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

  const { username, email, fullName, password } = req.body;
  // console.log("email",email);
  // console.log("fullname",fullName);
  // console.log("username",username);
  // console.log("password",password);

  // check for validations
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required");
  }

  //  check for existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exist");
  }

  //  console.log(existedUser , "existeing user");

  //  check for images
  // we use middleware in user.routes e.g. upload
  // multer gives u access of files

  // we need first property of that file
  const avatarLocalpath = req?.files?.avatar[0]?.path;
  // const files=req.files

  // console.log(files.path,"file path avatar image");

  // const coverImageLocalpath = req?.files?.coverImage[0]?.path
  let coverImageLocalpath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalpath = req.files.coverImage[0].path;
  }

  // validation for avatar image
  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // upload on cloudnary

  const avatar = await uploadFileOnCloudnary(avatarLocalpath);
  const coverImage = await uploadFileOnCloudnary(coverImageLocalpath);

  if (!avatar) {
    throw new ApiError(400, "Avatar is required");
  }

  //  create in db

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url ?? "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // console.log("Body:", req.body);

  // select is a method which will remove this two fileds
  const createdUser = await User.findById(user?._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regestring the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

// login user

const loginUser = asyncHandler(async (req, res) => {
  // login user
  // get details form frontend
  // check that username is exist or not
  // if exist then login user
  // password check
  // access and refresh token
  // send cookies of tokens

  const { username, email, password } = req.body;
  // console.log(email, "email");

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  let conditions = [];
  if (username) conditions.push({ username });
  if (email) conditions.push({ email });
  // finde by usename or email
  const user = await User.findOne({
    $or: conditions,
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.comparePassword(password);
    
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  //  generate access and refresh token
  const { refreshToken, accessToken } = await generateRfreshAndAccessToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  //  the cookies we will send is not modified form client
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          refreshToken,
          accessToken,
        },
        "User logged in successfully",
      ),
    );
});

// logout user

const logoutuser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1, //this will remove field from  document
      },
    },
    {
      new: true,
    },
  );

  // to clear cookies
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incominRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incominRefreshToken) {
    throw new ApiError(401, "unauthorised request");
  }

  try {
    const decodedToken = jwt.verify(
      incominRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incominRefreshToken != user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or already used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { refreshToken, accessToken } = await generateRfreshAndAccessToken(
      user._id,
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken: accessToken, refreshToken: refreshToken },
          "Access token refreshed successfully  ",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token");
  }
});

const changeCurrentpassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // if(newPassword !== confirmPassword){
  //   throw new ApiError (400,"Please enter correct new password and confirm password")
  // }

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect old password");
  }

  user.password = newPassword;
  // validateBeforeSave if for we dont need validation for other fields
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true, // it will give updated information
    },
  ).select("-password");

  return (
    res.status(200),
    json(new ApiResponse(200, user, "information updated successfully"))
  );
});

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.files?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadFileOnCloudnary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on cloudnary");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar image updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.files?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "CoverImage file is missing");
  }

  const coverImage = await uploadFileOnCloudnary(coverImageLocalPath);
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on cloudnary");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    },
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      // it matches username in mongo document
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      // it will join the table
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      // it will add fields to document on previous document
      $addFields: {
        subscribersCount: {
          // it will count the subscribers
          $size: "$subscribers",
        },
        channelSubscribed: {
          // it will count the channels this user is subscribed to
          $size: "$subscribedTo",
        },
        isSubscribed: {
          // it will give true/false (e.g. if user subscribed to channel or not)
          $cond: {
            // $in will check in object and array also
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      // it will gave selected fileds
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribed: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully"),
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        // because mongo db gives _id in string format son we need to convert it into object id
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos", //in database Video is converted into videos
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1, // 1 means include this field
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watchhistory fetched Successfully",
      ),
    );
});

export {
  registerUser,
  loginUser,
  logoutuser,
  refreshAccessToken,
  changeCurrentpassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
