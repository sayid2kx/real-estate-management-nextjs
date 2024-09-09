import mongoose, { Schema, models } from "mongoose";

const SellerSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Others"],
      required: true,
    },
    country: {
      type: String,
      enum: ["Bangladesh", "India", "Pakistan", "Nepal"],
      required: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const Seller = mongoose.models.Seller || mongoose.model("Seller", SellerSchema);
export default Seller;
