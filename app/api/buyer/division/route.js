import { connectToMongoDB } from '@/lib/database'
import Division from '@/app/models/Division'

export async function GET() {
  await connectToMongoDB()

  try {
    const divisions = await Division.find().lean().exec()
    return new Response(JSON.stringify(divisions), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    })
  }
}
