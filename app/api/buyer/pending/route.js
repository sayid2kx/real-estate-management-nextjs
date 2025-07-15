// File: /app/api/buyer/pending/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { connectToMongoDB } from '@/lib/database'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'

export async function GET() {
  await connectToMongoDB()
  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  if (!email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const pendingBuys = await BuyRequest.find({
      buyerEmail: email,
      status: 'pending',
    }).populate('property')

    const pendingNegotiations = await Negotiation.find({
      buyerEmail: email,
      status: 'pending',
    }).populate('property')

    const results = [
      ...pendingBuys.map((b) => ({
        type: 'buy',
        status: 'pending',
        property: b.property.toObject(),
      })),
      ...pendingNegotiations.map((n) => ({
        type: 'negotiation',
        status: 'pending',
        offerPrice: n.offerPrice,
        property: n.property.toObject(),
      })),
    ]

    return NextResponse.json({ results }, { status: 200 })
  } catch (error) {
    console.error('Failed to load pending orders:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
