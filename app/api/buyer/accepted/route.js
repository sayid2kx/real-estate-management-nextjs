import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToMongoDB } from '@/lib/database'
import Property from '@/app/models/properties'
import PropertyOwnership from '@/app/models/PropertyOwnership'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import District from '@/app/models/District'
import Division from '@/app/models/Division'

export async function GET(request) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const buyerEmail = session.user.email
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const propertyType = searchParams.get('propertyType') || ''
    const district = searchParams.get('district') || ''
    const division = searchParams.get('division') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    let query = {}
    if (propertyType) query.propertyType = propertyType
    if (district) query.district = district
    if (division) query.division = division

    const properties = await Property.find(query)
      .populate('district', 'name')
      .populate('division', 'name')
      .lean()

    const buyerRequests = await Promise.all([
      BuyRequest.find({
        buyerEmail,
        status: { $in: ['accepted', 'finalized'] },
      })
        .select('property')
        .lean(),
      Negotiation.find({
        buyerEmail,
        status: { $in: ['accepted', 'finalized'] },
      })
        .select('property')
        .lean(),
    ])

    const excludedPropertyIds = [
      ...buyerRequests[0].map((req) => req.property.toString()),
      ...buyerRequests[1].map((req) => req.property.toString()),
    ]

    const filteredProperties = await Promise.all(
      properties.map(async (property) => {
        if (excludedPropertyIds.includes(property._id.toString())) {
          return null
        }

        const ownership = await PropertyOwnership.findOne({
          property: property._id,
        }).lean()
        const isSold = ownership && ownership.status === 'finalized'

        if (status === 'available' && isSold) return null
        if (status === 'sold' && !isSold) return null

        return {
          ...property,
          district: property.district
            ? { name: property.district.name }
            : { name: 'N/A' },
          division: property.division
            ? { name: property.division.name }
            : { name: 'N/A' },
        }
      }),
    )

    const validProperties = filteredProperties.filter(Boolean)
    const total = validProperties.length
    const paginatedProperties = validProperties.slice(skip, skip + limit)

    return NextResponse.json(
      {
        properties: paginatedProperties,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { message: 'Failed to fetch properties', error: error.message },
      { status: 500 },
    )
  }
}
