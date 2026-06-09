import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js'


const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation -not empty
    //Check if user already exists :user ,email
    //Check for images ,check for avatar
    //Upload them to CLoudinary 
    //create user object --Mongo DB is NOSQL so takes objects
    //remove password and refresh token field from response 
    //check response for user creation 
    // return response

    const { fullName, email, username, password } = req.body
    console.log("email :", email);
    console.log("password :", password)
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({ email })
    $or: [{ username }, { email }]

    if (existedUser) {
        throw new ApiError(409, "User  with email or username alredy Existed")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Files is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar File is required")
    }
    User.create({
        fulName,
        avatar: avatar.url,
        coverImage: coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findbyId(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registring user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered")
    )
})

export {
    registerUser,
}