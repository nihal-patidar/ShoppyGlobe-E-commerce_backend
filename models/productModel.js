import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name : {
        type : String,   // defining type 
        required : [true , "Product name is required"],  // for mandatory field true 
        trim : true 
    },
    price :{
        type : Number, // defining type
        required : [true , "Product price is required"], // for mandatory field true
        min : [0 , "Price cannot be negative"] // defining min number allowed
    },
    description : {
        type : String,
        required : [true , "Product description is required"],
        trim : true
    },
    stock_quantity : {
        type : Number,
        required : [true , "Stock Quantity is required"],
        min : [0,"Stock Quantity cannot be negative"]
    }},
    {
        timestamps : true 
    }
)


export default mongoose.model('product',productSchema);