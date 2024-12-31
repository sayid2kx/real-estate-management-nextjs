import { connectToMongoDB } from '@/lib/database'
import Property from '@/app/models/properties'
import Division from '@/app/models/Division'
import District from '@/app/models/District'
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
  const { searchParams } = new URL(req.url)
  const sortOrder = searchParams.get('sortOrder')
  const propertyType = searchParams.get('propertyType')
  const district = searchParams.get('district')
  const division = searchParams.get('division')

  await connectToMongoDB()

  try {
    const baseQuery = { email }
    const filterQuery = { ...baseQuery }

    if (propertyType) filterQuery.propertyType = propertyType
    if (district) filterQuery.district = district
    if (division) filterQuery.division = division

    const allProperties = await Property.find(baseQuery)
      .populate('district')
      .exec()
    const filteredProperties = await Property.find(filterQuery)
      .populate('district')
      .exec()

    if (allProperties.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No properties found', properties: [] }),
        { status: 200 },
      )
    }

    if (filteredProperties.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No properties found in this filter criteria',
          properties: [],
        }),
        { status: 200 },
      )
    }

    if (sortOrder) {
      filteredProperties.sort((a, b) => {
        return sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      })
    }

    const divisions = await Division.find().lean().exec()

    const propertiesWithDetails = filteredProperties.map((property) => {
      const division = divisions.find(
        (d) => d._id.toString() === property.division.toString(),
      )

      return {
        ...property.toObject(),
        division: division ? { name: division.name } : { name: 'N/A' },
        district: property.district
          ? { name: property.district.name }
          : { name: 'N/A' },
      }
    })

    return new Response(
      JSON.stringify({
        message: 'Properties fetched successfully',
        properties: propertiesWithDetails,
      }),
      { status: 200 },
    )
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    })
  }
}
