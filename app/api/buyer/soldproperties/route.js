import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
  try {
    await connectToMongoDB()

    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { success: true, soldProperties: [] },
        { status: 200 },
      )
    }

    const buyerEmail = session.user.email

    const acceptedBuyRequests = await BuyRequest.find({
      buyerEmail: buyerEmail,
      status: 'accepted',
    })
      .populate('property', 'price')
      .select('property')
      .lean()

    const acceptedNegotiations = await Negotiation.find({
      buyerEmail: buyerEmail,
      status: 'accepted',
    })
      .select('property offerPrice')
      .lean()

    const soldProperties = []

    acceptedBuyRequests.forEach((req) => {
      if (req.property) {
        soldProperties.push({
          propertyId: req.property._id.toString(),
          finalPrice: req.property.price,
          saleType: 'buyRequest',
        })
      }
    })

    acceptedNegotiations.forEach((neg) => {
      soldProperties.push({
        propertyId: neg.property.toString(),
        finalPrice: neg.offerPrice,
        saleType: 'negotiation',
      })
    })

    const uniqueSoldPropertiesMap = new Map()
    soldProperties.forEach((item) => {
      if (
        !uniqueSoldPropertiesMap.has(item.propertyId) ||
        item.saleType === 'negotiation'
      ) {
        uniqueSoldPropertiesMap.set(item.propertyId, item)
      }
    })

    return NextResponse.json(
      {
        success: true,
        soldProperties: Array.from(uniqueSoldPropertiesMap.values()),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching sold properties:', error)
    return NextResponse.json(
      { message: 'Failed to fetch sold properties' },
      { status: 500 },
    )
  }
}
