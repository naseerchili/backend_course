import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from '../utils/ApiResponse.js'

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findBy(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

     //Save refresh Token to Database 
       user.refreshToken =refreshToken
       user.save({validBeforeSave :false})

       return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}
const registerUser = asyncHandler(async (req, res) => {
    // 1. Get user details from frontend
    const { fullName, email, username, password } = req.body

    // 2. Validation - not empty
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // 3. Check if user already exists (Checks BOTH email OR username correctly)
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // 4. Check for images using optional chaining to avoid crashes
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // 5. Upload them to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file failed to upload to Cloudinary")
    }

    // 6. Create user object (Added 'await' and saved returned value into 'newUser')
    const newUser = await User.create({
        fullName,
        avatar: avatar,
        coverImage: coverImage?.url || "", // Safely defaults to empty string if missing
        email,
        password,
        username: username.toLowerCase()
    })

    // 7. Check response for user creation and fetch without sensitive fields (Fixed typos)
    const createdUser = await User.findById(newUser._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // 8. Return response
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )
})

const loginUser = asynnHandler(async (req, res) => {
    //req body --> data
    // username or email
    //find the user 
    //password check
    //access and refresh Token 
    //Send cookie 

    const { email, username, password } = req.body

    if (!username || !email) {
        throw new ApiError(400, "username or pasword is required")
    }
    const user = User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.ispasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invaild user credentials")
    }
    
    const  {accessToken,refreshToken} = await 
    generateAccessAndRefreshToken(user._id)

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

    const options ={
        httpOnly:true,
        secure:true
    }

    return res 
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookies("refreshToken", refreshToken,Options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged In Sucessfully"
        )
    )

})

const logoutUser =asynHandler(async(req, res)=>{
    

})

export {
    registerUser,
}