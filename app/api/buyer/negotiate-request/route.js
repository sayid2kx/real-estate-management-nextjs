import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { connectToMongoDB } from '@/lib/database'
import Negotiation from '@/app/models/Negotiation'
import BuyRequest from '@/app/models/BuyRequest'
import Property from '@/app/models/properties'
import Buyer from '@/app/models/buyer' // Import Buyer model
import { sendNegotiationRequestEmail } from '@/lib/email'

export async function POST(req) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { negotiations } = body
    const buyerEmail = session.user.email

    // Fetch buyerId from Buyer model
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

    if (!Array.isArray(negotiations) || negotiations.length === 0) {
      return NextResponse.json(
        { message: 'Invalid negotiation data' },
        { status: 400 },
      )
    }

    const results = []
    const emailResults = []

    for (const item of negotiations) {
      const { propertyId, message, offerPrice } = item

      if (!propertyId || !offerPrice) {
        return NextResponse.json(
          { message: 'Missing required fields' },
          { status: 400 },
        )
      }

      const propertyExists = await Property.findById(propertyId).lean()
      if (!propertyExists) {
        return NextResponse.json(
          { message: `Property not found: ${propertyId}` },
          { status: 404 },
        )
      }

      if (!propertyExists.email) {
        return NextResponse.json(
          { message: `Seller email not found for property: ${propertyId}` },
          { status: 400 },
        )
      }

      const sellerEmail = propertyExists.email

      const existingNegotiation = await Negotiation.findOne({
        buyerEmail: buyerEmail,
        property: propertyId,
      })

      if (existingNegotiation) {
        return NextResponse.json(
          {
            message: `You have already sent a negotiation request for this property.`,
          },
          { status: 400 },
        )
      }

      const existingBuyRequest = await BuyRequest.findOne({
        buyerEmail: buyerEmail,
        property: propertyId,
      })

      if (existingBuyRequest) {
        return NextResponse.json(
          {
            message: `You have already sent a buy request for this property. You cannot send a negotiation.`,
          },
          { status: 400 },
        )
      }

      const newNegotiation = new Negotiation({
        property: propertyId,
        buyerEmail,
        sellerEmail,
        buyer: buyerId,
        message: message || '',
        offerPrice,
        status: 'pending',
      })

      await newNegotiation.save()

      const emailResult = await sendNegotiationRequestEmail({
        sellerEmail,
        buyerEmail,
        property: propertyExists,
        offerPrice,
        message: message || '',
      })

      if (!emailResult.success) {
        console.error(
          `Failed to send email notification for property ${propertyId}:`,
          emailResult.error,
        )
      }

      emailResults.push({
        propertyId,
        emailSent: emailResult.success,
      })

      results.push({
        propertyId,
        success: true,
      })
    }

    return NextResponse.json(
      {
        message: 'Negotiation request(s) sent successfully.',
        results,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Negotiation request error:', error)

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
      {
        message: 'Failed to process negotiation request',
        error: error.message,
      },
      { status: 500 },
    )
  }
}
