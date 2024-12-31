import mongoose from 'mongoose'

const divisionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
})

export default mongoose.models.Division ||
  mongoose.model('Division', divisionSchema)
