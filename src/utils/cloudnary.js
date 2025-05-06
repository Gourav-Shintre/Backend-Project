import { v2 as cloudinary } from "cloudinary";

//file system to handel file upload,delete
import fs from 'fs'


// cloudinary configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET 
});


const uploadFileOnCloudnary = async (localFilePath) =>{

  try {
    if(!localFilePath) return "file path not found"

    // upload file on cloudinary
    const response= await cloudinary.uploader.upload(localFilePath,
      {
        resource_type :"auto"
      }
    )
    // file uploaded successfully
    // console.log("file uploaded on cloudinary successfully",response.url)
    fs.unlinkSync(localFilePath)

    return response;

    
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    fs.unlinkSync(localFilePath) // it will remove that saved local file from locally
    return null
  }

}

export {uploadFileOnCloudnary}

