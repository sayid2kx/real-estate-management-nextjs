import { connectToMongoDB } from '@/lib/database'
import District from '@/app/models/District'

export async function GET() {
  await connectToMongoDB()

  try {
    const districts = await District.find().lean().exec()
    return new Response(JSON.stringify(districts), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    })
  }
}
