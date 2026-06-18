import mongoose from "mongoose"; // Import mongoose library to create schema and interact with MongoDB

// Define Product Schema (structure of product documents in MongoDB)
const productSchema = mongoose.Schema(
  {
    // Product Name Field
    name: {
      type: String, // Data type must be String
      required: [true, "Product name is required"], // Field is mandatory
      trim: true, // Removes extra spaces from beginning and end
    },

    // Product Price Field
    price: {
      type: Number, // Data type must be Number
      required: [true, "Product price is required"], // Field is mandatory
      min: [0, "Price cannot be negative"], // Price cannot be less than 0
    },

    // Product Description Field
    description: {
      type: String, // Data type must be String
      required: [true, "Product description is required"], // Field is mandatory
      trim: true, // Removes extra spaces
    },

    // Product Stock Quantity Field
    stock_quantity: {
      type: Number, // Data type must be Number
      required: [true, "Stock Quantity is required"], // Field is mandatory
      min: [0, "Stock Quantity cannot be negative"], // Stock cannot be less than 0
    },
  },

  // Schema Options
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export Product Model
// 'product' => MongoDB collection name will become 'products'
export default mongoose.model("product", productSchema);