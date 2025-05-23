import { Video } from "../models/video.model.js";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudnary } from "../utils/cloudnary.js";

const uploadVideo = asyncHandler(async (req, res) => {
  // get details from frontend
  // validation for required fields
  // check for video (upload to cloudnary)
  // send response

  const { title, description } = req.body;

  // console.log(videoFile,"request body");
  console.log("req.files:", req.files);

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoLocalPath = req?.files?.videoFile[0]?.path;

  const thumbNailLocalpath = req?.files?.thumbNail[0]?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Video  is required");
  }
  if (!thumbNailLocalpath) {
    throw new ApiError(400, "Thumbnail File is required");
  }

  const video = await uploadFileOnCloudnary(videoLocalPath);

  const thumbnail = await uploadFileOnCloudnary(thumbNailLocalpath);

  if (!video) {
    throw new ApiError(400, "Video File is required");
  }
  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail File is required");
  }

  const videoDetails = await Video.create({
    videoFile: video.url,
    thumbNail: thumbnail.url,
    title,
    description,
    duration: video.duration,
    owner: req?.user?._id,
  });

  if (!videoDetails) {
    throw new ApiError(500, "Something went wrong while regestring the video");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, videoDetails, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video id is required");
  }

  const mongoose = (await import("mongoose")).default;

  const objectId = new mongoose.Types.ObjectId(videoId);

  const videoDetails = await Video.aggregate([
    {
      $match: {
        _id: objectId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: {
        path: "$owner",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        onwer: "$owner.username",
      },
    },
    {
      $project: {
        videoFile: 1,
        thumbNail: 1,
        title: 1,
        description: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        owner: 1,
      },
    },
  ]);

  if (!videoDetails || videoDetails.length === 0) {
    throw new ApiError(404, "Video not found");
  }
  console.log(videoDetails, "VD");

  return res
    .status(200)
    .json(new ApiResponse(200, videoDetails, "video fetched successfully"));
});
export { uploadVideo, getVideoById };
