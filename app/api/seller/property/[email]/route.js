import { connectToMongoDB } from '@/lib/database'
import Property from '@/app/models/properties'
import Division from '@/app/models/Division'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req, res) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response(JSON.stringify({ message: 'User not authenticated' }), {
      status: 401,
    })
  }

  const { email } = session.user

  await connectToMongoDB()

  try {
    // Fetch properties
    const properties = await Property.find({ email })
      .populate('district')
      .exec()

    if (properties.length === 0) {
      return new Response(JSON.stringify({ message: 'No properties found' }), {
        status: 404,
      })
    }

    const divisions = await Division.find().lean().exec()

    const propertiesWithDetails = properties.map((property) => {
      const division = divisions.find(
        (d) => d._id.toString() === property.division.toString(),
      )

      return {
        ...property.toObject(),
        division: division ? { name: division.name } : { name: 'N/A' },
      }
    })

    return new Response(JSON.stringify(propertiesWithDetails), { status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    })
  }
}
