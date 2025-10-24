import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: CLOUDINARY_API_SECRET 
    });

    const uploadOnCloudinary = async(localFilePath)=>{
        try {
            if(!localFilePath) return null;

           
            const uploadResult = await cloudinary.uploader
            .upload(localFilePath, {
                resource_type: 'auto',
                }
            );
    
            console.log(`File uploaded successfully :) ${uploadResult} , uploaded url = ${uploadResult.url}`);
            return uploadResult;
        } catch (error) {
            fs.unlinkSync(localFilePath)//remove the saved file as the upload operation got failed
            console.log("error : file is not uploaded on cloudinary\n Error:", error)
            return null;
        }
    }

    export {uploadOnCloudinary}