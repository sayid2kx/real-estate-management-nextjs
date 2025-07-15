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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 5
    const sortOrder = searchParams.get('sortOrder') || ''
    const propertyType = searchParams.get('propertyType') || ''
    const district = searchParams.get('district') || ''
    const division = searchParams.get('division') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const totalInDatabase = await Property.countDocuments({})
    if (totalInDatabase === 0) {
      return NextResponse.json(
        { message: 'No properties found' },
        { status: 200 },
      )
    }

    let query = {}
    if (propertyType) query.propertyType = propertyType
    if (district) query.district = district
    if (division) query.division = division

    let sort = {}
    if (sortOrder === 'asc') sort.price = 1
    else if (sortOrder === 'desc') sort.price = -1

    const divisions = await Division.find().lean().exec()

    const baseProperties = await Property.find(query)
      .sort(sort)
      .populate('district', 'name')
      .lean()

    const processedProperties = await Promise.all(
      baseProperties.map(async (property) => {
        let propertyStatus = 'available'
        let purchasePrice = null
        let purchaseDate = null
        let buyerInfo = null
        let purchaseType = null

        const ownership = await PropertyOwnership.findOne({
          property: property._id,
        })
          .select('purchaseType requestId purchasePrice purchaseDate buyerInfo')
          .lean()

        if (ownership) {
          const { purchaseType: ownershipType, requestId } = ownership
          let request = null

          if (ownershipType === 'buy') {
            request = await BuyRequest.findById(requestId)
              .select('status')
              .lean()
          } else if (ownershipType === 'negotiation') {
            request = await Negotiation.findById(requestId)
              .select('status offerPrice')
              .lean()
          }

          if (request) {
            if (request.status === 'finalized') {
              propertyStatus = 'finalized'
              purchasePrice = ownership.purchasePrice
              purchaseDate = ownership.purchaseDate
              buyerInfo = ownership.buyerInfo
              purchaseType = ownershipType
            } else if (request.status === 'accepted') {
              propertyStatus = 'accepted'
              purchasePrice = ownership.purchasePrice
              purchaseDate = ownership.purchaseDate
              buyerInfo = ownership.buyerInfo
              purchaseType = ownershipType
            }
          }
        }

        const divisionData = divisions.find(
          (d) => d._id.toString() === property.division?.toString(),
        )

        return {
          ...property,
          status: propertyStatus,
          purchasePrice,
          purchaseDate,
          buyerInfo,
          purchaseType,
          division: divisionData
            ? { name: divisionData.name }
            : { name: 'N/A' },
          district: property.district
            ? { name: property.district.name }
            : { name: 'N/A' },
        }
      }),
    )

    let filteredProperties = processedProperties
    if (status) {
      if (status === 'sold') {
        filteredProperties = processedProperties.filter(
          (p) => p.status === 'finalized',
        )
      } else if (status === 'available') {
        filteredProperties = processedProperties.filter(
          (p) => p.status === 'available',
        )
      }
    }

    if (filteredProperties.length === 0) {
      return NextResponse.json(
        { message: 'No properties match the filter criteria' },
        { status: 200 },
      )
    }

    const total = filteredProperties.length
    const paginatedProperties = filteredProperties.slice(skip, skip + limit)

    return NextResponse.json(
      {
        properties: paginatedProperties,
        total,
        totalPages: Math.ceil(total / limit),
        totalProperties: total,
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
