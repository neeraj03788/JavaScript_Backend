
import mongoose ,{Schema} from 'mongoose'


const subscriptionSchema= new Schema({
    subscribe:{
        type:Schema.Types.ObjectId,
        //One who is Subscribing
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId,
        //one to whom 'subscriber' is subscribing
        ref:"User"
    }
},{
    timestamps:true
})


export const Subscription= mongoose.model("Subscription",subscriptionSchema)