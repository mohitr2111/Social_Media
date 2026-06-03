import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //    Upload the file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // console.log(
    //   `File uploaded successfully :) ${uploadResult} , uploaded url = ${uploadResult.url}`
    // );

    fs.unlinkSync(localFilePath);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the saved file as the upload operation got failed
    console.log("error : file is not uploaded on cloudinary\n Error:", error);
    return null;
  }
};

const deleteVideoFromCloudinary = async (elementUrl)=>{
  try {
    if(!elementUrl){
      throw new ApiError(500, "didnot recieve the public Id, (DFC)" )
    }
  
    const finalResult  = await cloudinary.uploader.destroy(elementUrl,{
      resource_type:"video",
      invalidate: true
    });
  
    if(finalResult.result == "not found"){
      console.log("Object not Found")
      return null;
    }
  
    return finalResult;
  } catch (error) {
    console.log("some error occur during deleting object from cloudinary in utils")
    return null;
  }
}
const deleteImageFromCloudinary = async (elementUrl)=>{
  try {
    if(!elementUrl){
      throw new ApiError(500, "didnot recieve the public Id , (DFC)" )
    }
  
    const finalResult  = await cloudinary.uploader.destroy(elementUrl,{
      resource_type:"image",
      invalidate: true
    });
  
    if(finalResult.result == "not found"){
      console.log("Object not Found")
      return null;
    }
  
    return finalResult;
  } catch (error) {
    console.log("some error occur during deleting object from cloudinary in utils")
    return null;
  }
}

export { 
  uploadOnCloudinary,
  deleteVideoFromCloudinary, 
  deleteImageFromCloudinary 
};
