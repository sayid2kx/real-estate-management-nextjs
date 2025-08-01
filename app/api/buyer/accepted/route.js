import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectToMongoDB } from '@/lib/database'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import PropertyOwnership from '@/app/models/PropertyOwnership'
import Property from '@/app/models/properties'

export async function GET(request) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const buyerEmail = session.user.email

    // Fetch both buy requests and negotiations
    const [buyRequests, negotiations] = await Promise.all([
      BuyRequest.find({
        buyerEmail,
        status: { $in: ['accepted', 'finalized'] },
      })
        .populate('property')
        .lean(),
      Negotiation.find({
        buyerEmail,
        status: { $in: ['accepted', 'finalized'] },
      })
        .populate('property')
        .lean(),
    ])

    // Combine results and add type indicator
    let orders = [
      ...buyRequests.map((req) => ({ ...req, type: 'buy' })),
      ...negotiations.map((neg) => ({ ...neg, type: 'negotiation' })),
    ]

    // Fetch additional data for each order
    orders = await Promise.all(
      orders.map(async (order) => {
        // 1. Get property's original price from Property model
        const property = await Property.findById(order.property._id).lean()
        const originalPrice = property?.price || 0

        // 2. Get ownership details from PropertyOwnership
        const ownership = await PropertyOwnership.findOne({
          property: order.property._id,
          requestId: order._id,
        }).lean()

        return {
          ...order,
          property: {
            ...order.property,
            originalPrice, // Add original price to property object
          },
          ownership: ownership || null,
          purchasePrice: ownership?.purchasePrice || 0,
        }
      }),
    )

    return NextResponse.json({ orders }, { status: 200 })
  } catch (error) {
    console.error('Error fetching accepted orders:', error)
    return NextResponse.json(
      { message: 'Failed to fetch accepted orders', error: error.message },
      { status: 500 },
    )
  }
}
