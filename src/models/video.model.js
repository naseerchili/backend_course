import mongoose,{Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
const videoSchema=new SChema({
   VideoFile:{
       type:String,//Cloudainary URL
       required:true,
    },
    thumbnail:{
        type:String,
        requied :true,
     },
     title:{
        type:String,
        required:true,
    },
    duration:{
        type:Number,//cloudinary url
        required:true,
    },
    views:{
        type:Number,
        default:0,
    },
    ispublished:{
        type:Boolean,
        default:true,
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema)
