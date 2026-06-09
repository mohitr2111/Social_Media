import { verifyJWT } from "../middlewares/auth.middleware.js";
import { Post } from "../models/post.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteImageFromCloudinary, deleteMultipleResources } from "../utils/cloudinary.js";

// todo
// getPostComments


const createPost = asyncHandler(async(req, res)=>{
    // take content
    // take user from params
    //take array for 12 photos using multer
    // validate them 
    //if images exist 
        // upload all images on cloudinary 
        // if a image fail to get uploaded on cloudinary
            // get all images which is successfully upload and delete them  
            // if not all images get deleted give error try again
        // store the all url, public_id in array    
    // create post by adding content, owner , array of photos
    // check post created or not 
    // response

    const {content} = req.body;
    const user = req.user;
    const imageFiles = req.files?.images || [];
    const localPathOfImages = imageFiles.map(file => file.path) ;

    if(!content || content.trim() === ""){
        throw new ApiError(400, "content is required for post")
    }

    if(!user){
        throw new ApiError(400, "You need a Account to create a post, SignUp or LogIn")
    }

    if(imageFiles.length != localPathOfImages.length){
        throw new ApiError(500, "Something went Wrong while taking the path of images, retry ")
    }

    let resultFromCoudinary = [];

    if(localPathOfImages && localPathOfImages.length){
        resultFromCoudinary = await Promise.all(
            localPathOfImages.map(
                element => uploadOnCloudinary(element).catch((error)=>{
                    console.error(`Cloudinary upload failed for ${element}`, error)
                    return null;
                })
            )
        )
    }

    const successfullyUploadOnCloudinary = resultFromCoudinary.filter(element => element != null)


    if(localPathOfImages.length !== successfullyUploadOnCloudinary.length){

        if(successfullyUploadOnCloudinary.length > 0){
            const deleteUploadedImages = await Promise.all(
                successfullyUploadOnCloudinary.map(
                    element => deleteImageFromCloudinary(element?.public_id).catch(error => {
                        console.error(`Deletion of uploaded image ${element} failed`, error);
                        return null;
                    })
                )
            )

            const numberOfFailedDeletedImage = deleteUploadedImages.filter(ele => ele === null)

            if(numberOfFailedDeletedImage.length >0){
                throw new ApiError(500, "Upload failed, and some leaked images could not be cleaned up from Cloudinary.")
            }

        }


        throw new ApiError(500, "All images cant be uploaded on cloudinary. Cleaned up all the temporary files.")
    }

    const detailsOfImageToSaveOnDataBase = successfullyUploadOnCloudinary.map(ele => {
        return {
            url :ele.url,
            public_id :ele.public_id
        }
    })

    const createdPost = await Post.create(
        {
            owner: user._id,
            content,
            images : detailsOfImageToSaveOnDataBase
        }
    )

    if(!createdPost){
        throw new ApiError(500, "Post not created, try again")
    }

    res
    .status(201)
    .json(new ApiResponse(201, createdPost, "Post created Successfully"))
});

const getPostById = asyncHandler(async(req, res)=>{
    // you dont need to be loggined
    // get postId
    //search for that 
    // res

    const post_id = req.params?.postId;
    if(!post_id){
        throw new ApiError(400,"post id is required")
    }

    const post = await Post.findById(post_id);
    if(!post){
        throw new ApiError (404, "No such Post exist by this post id")
    }

    res
    .status(200)
    .json(new ApiResponse(200, post, "Detail of Post is fetched "))
});

const updatePost = asyncHandler(async(req, res)=>{
    // content is changed
    // photo is deleted
    // photo is added 
    // both

    const {content , toBeDeletedImages=[]} = req.body;
    const user = req.user;
    const post_id = req.params?.postId;
    if(!content || content.trim()===""){
        throw new ApiError(400, "content is required")
    }
    if(!user){
        throw new ApiError(400, "You need to be Logged in")
    }
    if(!post_id){
        throw new ApiError(400, "Post id required!!")
    }

    const post = await Post.findById(post_id);
    if(!post){
        throw new ApiError(404, "No such Post exist by this post id")
    }

    if(post.owner.toString() !== user._id.toString()){
        throw new ApiError(400, "You are not Authorized to edit this post")
    }

    const newImages = req.files?.images || [];
    const localPathNewImages = newImages.map(file=>file.path)

    if((post.images.length - toBeDeletedImages.length + localPathNewImages.length) > 12){
        throw new ApiError(400, "max no. of images can only be 12")
    }

    if(toBeDeletedImages.length > 0){

        const deletedResult = await deleteMultipleResources(toBeDeletedImages)

        await Post.updateOne(
            { _id:post._id},
            {
                $pull : {images:{ public_id : {$in:toBeDeletedImages}}}
            }
        );

        // if(deletedResult.length !== deletedVideos.length){
        //     throw new ApiError(500, "Not all images are deleted so please try again")
        // }
    }

    const updatedPost = await Post.findById(post._id);


    let resultCloudinary = []
    if(localPathNewImages.length > 0){
        resultCloudinary = await Promise.all(
            localPathNewImages.map(
                ele=>uploadOnCloudinary(ele).catch(error=>{
                    console.error(`failed to upload the image with public_id ${ele}`, error)
                    return null;
                })
            )
        )
    }

    const successfullyUploadOnCloudinary = resultCloudinary.filter(ele => ele != null);

    if(successfullyUploadOnCloudinary.length != resultCloudinary.length){

        if(successfullyUploadOnCloudinary.length > 0){
            const deleteUploadedImages = await deleteMultipleResources(successfullyUploadOnCloudinary.map(ele=>ele.public_id))
        }


        throw new ApiError(500, "All images cant be uploaded on cloudinary. Cleaned up all the temporary files., try again")
    }
    
    const array = successfullyUploadOnCloudinary.map(ele=>{
        return {
            url:ele.url,
            public_id:ele.public_id
        }
    })

    updatedPost.content  = content;
    updatedPost.images.push(...array);
    await updatedPost.save();

    res
    .status(200)
    .json(new ApiResponse(200, updatedPost, "post is updated successfully"))

});


export {
    createPost,
    getPostById,
    updatePost
};
