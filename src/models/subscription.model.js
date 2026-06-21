import mongoose, {Schema} from "mongoose";
// import { User } from "./user.model.js";

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true

    },
    channel:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required : true
    }
},{timestamps:{
    createdAt:true
}})

subscriptionSchema.index(
    {
        subscriber : 1,
        channel : 1
    },
    {
        unique: true
    }
)

export const Subscription = mongoose.model("Subscription", subscriptionSchema)