import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import Review from '@/app/models/review'
import PropertyOwnership from '@/app/models/PropertyOwnership'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import Property from '@/app/models/properties'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PUT(request) {
  try {
    await connectToMongoDB()

    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const buyerEmail = session.user.email
    const { propertyId, buyerMessage } = await request.json()

    if (!propertyId || !buyerMessage) {
      return NextResponse.json(
        {
          message: 'Missing required fields (propertyId or buyerMessage)',
        },
        { status: 400 },
      )
    }

    const propertyDetails = await Property.findById(propertyId)
      .select('propertyTitle price email')
      .lean()

    if (!propertyDetails) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 },
      )
    }

    const ownership = await PropertyOwnership.findOne({
      property: propertyId,
      currentOwner: buyerEmail,
    })

    if (!ownership) {
      return NextResponse.json(
        {
          message: 'No ownership record found for this property by this buyer.',
        },
        { status: 404 },
      )
    }

    let transactionFound = false

    if (ownership.purchaseType === 'buy') {
      const buyRequest = await BuyRequest.findOne({
        _id: ownership.requestId,
        property: propertyId,
        buyerEmail: buyerEmail,
        status: 'finalized',
      })

      if (buyRequest) {
        transactionFound = true
      }
    } else if (ownership.purchaseType === 'negotiation') {
      const negotiation = await Negotiation.findOne({
        _id: ownership.requestId,
        property: propertyId,
        buyerEmail: buyerEmail,
        status: 'finalized',
      })

      if (negotiation) {
        transactionFound = true
      }
    }

    if (!transactionFound) {
      return NextResponse.json(
        {
          message:
            'No finalized transaction found for this property by this buyer.',
        },
        { status: 404 },
      )
    }

    const existingReview = await Review.findOne({
      property: propertyId,
      buyerEmail: buyerEmail,
    })

    if (!existingReview) {
      return NextResponse.json(
        { message: 'No review found to edit' },
        { status: 404 },
      )
    }

    existingReview.buyerMessage = buyerMessage
    await existingReview.save()

    return NextResponse.json(
      { message: 'Review updated successfully', review: existingReview },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { message: 'Failed to update review' },
      { status: 500 },
    )
  }
}
