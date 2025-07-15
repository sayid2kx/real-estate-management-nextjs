// File: /app/api/buyer/rejected/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { connectToMongoDB } from '@/lib/database'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import Property from '@/app/models/properties'

export async function GET() {
  await connectToMongoDB()
  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  if (!email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rejectedBuys = await BuyRequest.find({
      buyerEmail: email,
      status: 'rejected',
    }).populate('property')

    const rejectedNegotiations = await Negotiation.find({
      buyerEmail: email,
      status: 'rejected',
    }).populate('property')

    const results = [
      ...rejectedBuys.map((b) => ({
        type: 'buy',
        status: 'rejected',
        property: {
          ...b.property.toObject(),
          originalPrice: b.property.price,
        },
      })),
      ...rejectedNegotiations.map((n) => ({
        type: 'negotiation',
        status: 'rejected',
        offerPrice: n.offerPrice,
        property: {
          ...n.property.toObject(),
          originalPrice: n.property.price,
        },
      })),
    ]

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error('Failed to load rejected orders:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
