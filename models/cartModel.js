import mongoose from "mongoose";

// Cart Schema
// userId    -> References the user who owns the cart item
// productId -> References the product added to the cart
// quantity  -> Number of units of the product added to the cart

const cartSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId, // stores User document _id
    required: true, // cart item must belong to a user
  },

  productId: {
    type: mongoose.Types.ObjectId, // stores Product document _id
    required: true, // cart item must reference a product
  },

  quantity: {
    type: Number, // quantity of product in cart
    required: [true, "Quantity is required"], // mandatory field
    min: [1, "Quantity cannot be less than 1"], // minimum allowed quantity
  },
});

// Create and export Cart model
// Collection name: carts
export default mongoose.model("cart", cartSchema);