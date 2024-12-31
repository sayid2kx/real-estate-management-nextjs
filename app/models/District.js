import mongoose from 'mongoose'

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  division: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Division',
    required: true,
  },
})

export default mongoose.models.District ||
  mongoose.model('District', districtSchema)
