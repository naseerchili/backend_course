import { v2 as cloudinary } from "cloudinary";
import fd from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (LocalFilePath) => {
    try {
        if (!LocalFilePath) throw new Error("File path is required")
        //upload the File on CLoudinary 
        const result = await cloudinary.uploader.upload(LocalFilePath, {
            resource_type: "auto"
        })
        //File has been uploaded 
        console.log("File is been uploaded on Cloudinary", result.url);
        return result.url;
    } catch (error) {
        fs.unlinkSync(LocalFilePath)
        // remove the locally saved tempory file as the upload operation got failed 
        return null;
    }
}

export {uploadOnCloudinary}






