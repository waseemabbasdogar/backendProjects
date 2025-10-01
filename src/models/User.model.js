import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    full_name: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String, // cloudinary image url
        required: true
    },
    coverImage : {
        type: String, // cloudinary image url
    },
    watchHistory: [
        {
        type: Schema.Types.ObjectId,
        ref: "Video"
    }
    ],
    refreshToken: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id : this._id,
        username: this.username,
        email: this.email,
        full_name : this.full_name
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id : this._id,
    },
    process.env.ACCESS_REFRESH_SECRET,
    {
        expiresIn: process.env.ACCESS_REFRESH_EXPIRY
    }
)
}

export const User = mongoose.model("User", userSchema)