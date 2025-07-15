import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToMongoDB } from '@/lib/database'
import { authOptions } from '../../auth/[...nextauth]/route'
import Property from '@/app/models/properties'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import Buyer from '@/app/models/buyer'
import { sendBuyRequestEmail } from '@/lib/email'

export async function POST(req) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json(
        { message: 'Property ID is required' },
        { status: 400 },
      )
    }

    const buyerEmail = session.user.email

    const buyer = await Buyer.findOne({ email: buyerEmail })
      .select('_id')
      .lean()
    if (!buyer) {
      return NextResponse.json(
        {
          message:
            'Buyer not found. Please make sure you are registered as a buyer.',
        },
        { status: 404 },
      )
    }

    const buyerId = buyer._id

    const propertyExists = await Property.findById(propertyId).lean()
    if (!propertyExists) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 },
      )
    }

    if (!propertyExists.email) {
      return NextResponse.json(
        { message: 'Seller email not found for this property' },
        { status: 400 },
      )
    }

    const sellerEmail = propertyExists.email

    const existingBuyRequest = await BuyRequest.findOne({
      buyerEmail: buyerEmail,
      property: propertyId,
    })

    if (existingBuyRequest) {
      return NextResponse.json(
        { message: 'You have already sent a buy request for this property.' },
        { status: 400 },
      )
    }

    const existingNegotiation = await Negotiation.findOne({
      buyerEmail: buyerEmail,
      property: propertyId,
    })

    if (existingNegotiation) {
      return NextResponse.json(
        {
          message:
            'You have already sent a negotiation request for this property. You cannot send a buy request.',
        },
        { status: 400 },
      )
    }

    const newBuyRequest = new BuyRequest({
      property: propertyId,
      buyerEmail,
      sellerEmail,
      buyer: buyerId,
      status: 'pending',
    })

    await newBuyRequest.save()

    const emailResult = await sendBuyRequestEmail({
      sellerEmail,
      buyerEmail,
      property: propertyExists,
    })

    if (!emailResult.success) {
      console.error('Failed to send email notification:', emailResult.error)
    }

    return NextResponse.json(
      { message: 'Buy request sent successfully.' },
      { status: 201 },
    )
  } catch (error) {
    console.error('Buy request error:', error)

    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map((field) => ({
        field,
        message: error.errors[field].message,
      }))

      return NextResponse.json(
        {
          message: 'Validation failed',
          validationErrors,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { message: 'Failed to process request', error: error.message },
      { status: 500 },
    )
  }
}
