import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToMongoDB } from '@/lib/database'
import { authOptions } from '../../auth/[...nextauth]/route'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'

export async function GET() {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const buyerEmail = session.user.email

    const buyRequestsCount = await BuyRequest.countDocuments({
      buyerEmail,
    })

    const negotiationRequestsCount = await Negotiation.countDocuments({
      buyerEmail,
    })

    const totalCount = buyRequestsCount + negotiationRequestsCount

    return NextResponse.json(
      {
        count: totalCount,
        buyRequestsCount,
        negotiationRequestsCount,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error counting requests:', error)
    return NextResponse.json(
      { message: 'Failed to count requests', error: error.message },
      { status: 500 },
    )
  }
}
