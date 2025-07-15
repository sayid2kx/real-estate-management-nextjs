import mongoose from 'mongoose'

const ChatSchema = new mongoose.Schema(
  {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    buyerEmail: {
      type: String,
      required: true,
    },
    sellerEmail: {
      type: String,
      required: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    unreadBuyer: {
      type: Number,
      default: 0,
    },
    unreadSeller: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

ChatSchema.index(
  { buyerEmail: 1, sellerEmail: 1, propertyId: 1 },
  { unique: true },
)

const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema)
export default Chat
