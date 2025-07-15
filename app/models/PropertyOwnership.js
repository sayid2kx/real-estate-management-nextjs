import mongoose from 'mongoose'

const PropertyOwnershipSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    currentOwner: {
      type: String,
      required: true,
    },
    originalOwner: {
      type: String,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    purchaseType: {
      type: String,
      enum: ['buy', 'negotiation'],
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    buyerInfo: {
      fullname: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      username: { type: String, default: '' },
      address: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'transferred'],
      default: 'active',
    },
  },
  { timestamps: true },
)

PropertyOwnershipSchema.index({ property: 1, currentOwner: 1 })
PropertyOwnershipSchema.index({ currentOwner: 1 })
PropertyOwnershipSchema.index({ originalOwner: 1 })
PropertyOwnershipSchema.index({ property: 1, requestId: 1 }, { unique: true })

const PropertyOwnership =
  mongoose.models.PropertyOwnership ||
  mongoose.model('PropertyOwnership', PropertyOwnershipSchema)

export default PropertyOwnership
