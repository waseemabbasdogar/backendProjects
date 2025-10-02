import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    
    // 1. Get user detail from frontend i.e. username, fullName, email, password, avatar, coverImage,

    // 2. Validation of user detail - not empty

    // 3. Check if user already exist: email, username

    // 4. Check for images, check for avatar compulsory

    // 5. Upload images on cloudinary, avatar

    // 6. Create user object, create a DB call (in DB entry)

    // 7. Remove password and fresh token fields from response.

    // 8. Check for user creation

    // 9. return response.

    const {username, fullName, email, password} = req.body
    console.log("Email: ", email)

    if(
        [username, fullName, email, password].some((field) => field?.trim === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{email}, {username}]
    })

    if(existedUser){
        throw new ApiError(409, "User with this email or username already existed.")
    }

    const avatarLocalPath = req.files?.avatar[0].path
    const coverImageLocalPath = req.files?.coverImage[0].path

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )

})

export { registerUser }