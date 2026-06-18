import mongoose from "mongoose";

// User Schema
// Stores authentication and basic profile information for each user

const userSchema = mongoose.Schema(
  {
    name: {
      type: String, // user's full name
      required: [true, "Name is required"], // mandatory field
      trim: true, // removes leading and trailing spaces
    },

    email: {
      type: String, // user's email address
      required: [true, "Email is required"], // mandatory field
      unique: true, // prevents duplicate email registrations
      trim: true, // removes leading and trailing spaces
      lowercase: true, // converts email to lowercase before saving
    },

    password: {
      type: String, // hashed user password
      required: [true, "Password is required"], // mandatory field
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  }
);

// Create and export User model
// Collection name: users
export default mongoose.model("user", userSchema);