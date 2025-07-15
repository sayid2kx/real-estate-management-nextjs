import mongoose from 'mongoose'

const CartItemSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
})

const CartSchema = new mongoose.Schema(
  {
    buyerEmail: {
      type: String,
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
  },
  { timestamps: true },
)

const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema)
export default Cart
