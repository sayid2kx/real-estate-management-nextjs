import { connectToMongoDB } from '@/lib/database'
import Division from '@/app/models/Division'

export async function GET() {
  try {
    await connectToMongoDB()
    const divisions = await Division.find({})
    return Response.json(divisions)
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch divisions' },
      { status: 500 },
    )
  }
}
