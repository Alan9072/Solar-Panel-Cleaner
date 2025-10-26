import mongoose from 'mongoose'

const UserSchema = mongoose.Schema({
    name:{
        required:true,
        type:String
    },
    username:{
        required:true,
        type:String,
        unique:true,
    },
    password:{
        required:true,
        type:String,
    }
})

const user = mongoose.model("user",UserSchema,"user");

export default user;