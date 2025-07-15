// app/api/seller/order-requests/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToMongoDB } from '@/lib/database'
import { authOptions } from '../../auth/[...nextauth]/route'
import Property from '@/app/models/properties'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import Buyer from '@/app/models/buyer'

export async function GET(req) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const sellerEmail = session.user.email

    const buyRequests = await BuyRequest.find({ sellerEmail })
      .populate('property')
      .sort({ createdAt: -1 })
      .lean()

    const negotiations = await Negotiation.find({ sellerEmail })
      .populate('property')
      .sort({ createdAt: -1 })
      .lean()

    const buyerEmails = [
      ...new Set([
        ...buyRequests.map((req) => req.buyerEmail),
        ...negotiations.map((neg) => neg.buyerEmail),
      ]),
    ]

    const buyers = await Buyer.find({ email: { $in: buyerEmails } }).lean()
    const buyersMap = buyers.reduce((acc, buyer) => {
      acc[buyer.email] = buyer
      return acc
    }, {})

    const buyRequestsWithBuyer = buyRequests.map((request) => ({
      ...request,
      buyerInfo: buyersMap[request.buyerEmail] || null,
    }))

    const negotiationsWithBuyer = negotiations.map((negotiation) => ({
      ...negotiation,
      buyerInfo: buyersMap[negotiation.buyerEmail] || null,
    }))

    return NextResponse.json({
      message: 'Order requests fetched successfully',
      buyRequests: buyRequestsWithBuyer,
      negotiations: negotiationsWithBuyer,
    })
  } catch (error) {
    console.error('Error fetching seller order requests:', error)
    return NextResponse.json(
      { message: 'Failed to fetch order requests', error: error.message },
      { status: 500 },
    )
  }
}
