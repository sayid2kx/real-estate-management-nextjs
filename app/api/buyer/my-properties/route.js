import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import PropertyOwnership from '@/app/models/PropertyOwnership'
import Property from '@/app/models/properties'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import Division from '@/app/models/Division'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(request) {
  try {
    await connectToMongoDB()

    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const buyerEmail = session.user.email

    const ownerships = await PropertyOwnership.find({
      currentOwner: buyerEmail,
    }).lean()

    if (!ownerships || ownerships.length === 0) {
      return NextResponse.json(
        { message: 'No properties found', properties: [] },
        { status: 200 },
      )
    }

    const propertyIds = ownerships.map((ownership) => ownership.property)

    const buyRequests = await BuyRequest.find({
      property: { $in: propertyIds },
      status: 'finalized',
    }).lean()

    const negotiations = await Negotiation.find({
      property: { $in: propertyIds },
      status: 'finalized',
    }).lean()

    const finalizedPropertyIds = [
      ...buyRequests.map((br) => br.property.toString()),
      ...negotiations.map((n) => n.property.toString()),
    ]

    const filteredOwnerships = ownerships.filter((ownership) =>
      finalizedPropertyIds.includes(ownership.property.toString()),
    )

    if (filteredOwnerships.length === 0) {
      return NextResponse.json(
        { message: 'No properties found', properties: [] },
        { status: 200 },
      )
    }

    const divisions = await Division.find().lean().exec()

    const properties = await Property.find({
      _id: { $in: filteredOwnerships.map((o) => o.property) },
    })
      .populate('district', 'name')
      .lean()

    const propertiesWithDetails = properties.map((property) => {
      const ownership = filteredOwnerships.find(
        (o) => o.property.toString() === property._id.toString(),
      )
      const division = divisions.find(
        (d) => d._id.toString() === property.division?.toString(),
      )
      return {
        ...property,
        division: division ? { name: division.name } : { name: 'N/A' },
        district: property.district
          ? { name: property.district.name }
          : { name: 'N/A' },
        soldDetails: ownership
          ? {
              status: 'finalized',
              purchaseType: ownership.purchaseType,
              purchasePrice: ownership.purchasePrice,
              purchaseDate: ownership.purchaseDate,
              buyerInfo: ownership.buyerInfo,
            }
          : null,
      }
    })

    return NextResponse.json(
      {
        message: 'Properties fetched successfully',
        properties: propertiesWithDetails,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { message: 'Failed to fetch properties' },
      { status: 500 },
    )
  }
}
