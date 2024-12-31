import { connectToMongoDB } from '@/lib/database'
import District from '@/app/models/District'

export async function GET() {
  try {
    await connectToMongoDB()
    const districts = await District.find({})
    return Response.json(districts)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch districts' },
      { status: 500 },
    )
  }
}
