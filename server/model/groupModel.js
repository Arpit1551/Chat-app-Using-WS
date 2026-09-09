import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    members:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now()
    }
});

const group = mongoose.model('group',groupSchema);
export default group;