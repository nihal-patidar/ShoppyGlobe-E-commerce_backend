import mongoose from "mongoose";

const cartSchema = mongoose.Schema({
    userId : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    productId : {
        type : mongoose.Types.ObjectId,
        required : true
    },
    quantity : {
        type : Number,
        required : [true,"Quantity is required"],
        min : [1,"Quantity cannot be less than 1"]
    }

})

export default mongoose.model('cart',cartSchema);