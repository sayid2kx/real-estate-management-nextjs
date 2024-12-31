import { connectToMongoDB } from '@/lib/database'
import Property from '@/app/models/properties'

export async function PUT(req, { params }) {
  const { id } = params
  const data = await req.json()

  await connectToMongoDB()

  try {
    const updatedProperty = await Property.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    })

    if (!updatedProperty) {
      return new Response(JSON.stringify({ message: 'Property not found' }), {
        status: 404,
      })
    }

    return new Response(JSON.stringify(updatedProperty), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    })
  }
}
