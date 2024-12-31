import { connectToMongoDB } from '@/lib/database'
import Property from '@/app/models/properties'

export async function DELETE(req, { params }) {
  const { id } = params

  await connectToMongoDB()

  try {
    const property = await Property.findById(id)

    if (!property) {
      return new Response(JSON.stringify({ message: 'Property not found' }), {
        status: 404,
      })
    }

    await Property.deleteOne({ _id: id })

    return new Response(
      JSON.stringify({ message: 'Property deleted successfully' }),
      { status: 200 },
    )
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    })
  }
}
