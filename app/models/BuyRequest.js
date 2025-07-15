import mongoose from 'mongoose'

const BuyRequestSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    buyerEmail: { type: String, required: true },
    sellerEmail: { type: String, required: true },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Buyer',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'finalized'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

export default mongoose.models.BuyRequest ||
  mongoose.model('BuyRequest', BuyRequestSchema)
