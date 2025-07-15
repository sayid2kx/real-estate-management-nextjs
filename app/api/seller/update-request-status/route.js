import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToMongoDB } from '@/lib/database'
import { authOptions } from '../../auth/[...nextauth]/route'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import {
  sendBuyRequestStatusEmail,
  sendNegotiationRequestStatusEmail,
} from '@/lib/email'

export async function PUT(req) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { requestId, requestType, status } = body

    if (!requestId || !requestType || !status) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 },
      )
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 },
      )
    }

    const sellerEmail = session.user.email
    let result

    if (requestType === 'buy') {
      const buyRequest = await BuyRequest.findOne({
        _id: requestId,
        sellerEmail,
      }).populate('property')

      if (!buyRequest) {
        return NextResponse.json(
          { message: 'Buy request not found or unauthorized' },
          { status: 404 },
        )
      }

      buyRequest.status = status
      result = await buyRequest.save()

      const emailResult = await sendBuyRequestStatusEmail({
        buyerEmail: buyRequest.buyerEmail,
        property: buyRequest.property,
        status,
      })

      if (!emailResult.success) {
        console.error(
          'Failed to send buy request status email:',
          emailResult.error,
        )
      }
    } else if (requestType === 'negotiation') {
      const negotiation = await Negotiation.findOne({
        _id: requestId,
        sellerEmail,
      }).populate('property')

      if (!negotiation) {
        return NextResponse.json(
          { message: 'Negotiation request not found or unauthorized' },
          { status: 404 },
        )
      }

      negotiation.status = status
      result = await negotiation.save()

      const emailResult = await sendNegotiationRequestStatusEmail({
        buyerEmail: negotiation.buyerEmail,
        property: negotiation.property,
        offerPrice: negotiation.offerPrice,
        status,
      })

      if (!emailResult.success) {
        console.error(
          'Failed to send negotiation request status email:',
          emailResult.error,
        )
      }
    } else {
      return NextResponse.json(
        { message: 'Invalid request type' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      message: `${requestType} request ${status} successfully`,
      result,
    })
  } catch (error) {
    console.error('Error updating request status:', error)
    return NextResponse.json(
      { message: 'Failed to update request status', error: error.message },
      { status: 500 },
    )
  }
}
