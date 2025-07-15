import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    propertyName: {
      type: String,
      required: true,
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    negotiatedPrice: {
      type: Number,
      required: false,
    },
    sellerEmail: {
      type: String,
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    buyerMessage: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true },
)

const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema)

export default Review
