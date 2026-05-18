import mongoose from "mongoose";

//Users Schema
const userSchema = new mongoose.Schema(
    {
        firstName:{
            type:String,
            required: true
        },
        lastName:{
            type:String,
            required: true
        },
        email:{
            type:String,
            required: true,
            unique:true
        },
        password:{
            type:String,
            required: true
        },
        phone:{
            type:String,
            default:"Not Given"
        },
        isBlocked:{
            type:Boolean,
            default:false
        },
        role:{
            type:String,
            default:'user'
        },
        isEmailVerified:{
            type:Boolean,
            default:false
        },
        image:{
            type:String,
            default:"https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
        } //Super Base String

    }
)

const User = mongoose.model("users",userSchema)

export default User