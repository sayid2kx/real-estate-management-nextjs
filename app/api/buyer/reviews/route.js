import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import Review from '@/app/models/review'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import Property from '@/app/models/properties'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const buyerEmail = session.user.email
    const { propertyId, buyerMessage, rating } = await request.json()

    if (
      !propertyId ||
      !buyerMessage ||
      rating === undefined ||
      rating === null
    ) {
      return NextResponse.json(
        {
          message:
            'Missing required fields (propertyId, buyerMessage, or rating)',
        },
        { status: 400 },
      )
    }

    const ratingNum = parseInt(rating, 10)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { message: 'Invalid rating value. Must be between 1 and 5.' },
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

    const sellerEmail = propertyDetails.email
    const originalPrice = propertyDetails.price
    const propertyName = propertyDetails.propertyTitle

    let finalPrice = null
    let transactionFound = false
    let saleType = null

    const buyRequest = await BuyRequest.findOne({
      property: propertyId,
      buyerEmail: buyerEmail,
      status: 'accepted',
    })

    if (buyRequest) {
      finalPrice = originalPrice
      transactionFound = true
      saleType = 'buyRequest'
    } else {
      const negotiation = await Negotiation.findOne({
        property: propertyId,
        buyerEmail: buyerEmail,
        status: 'accepted',
      })

      if (negotiation) {
        finalPrice = negotiation.offerPrice
        transactionFound = true
        saleType = 'negotiation'
      }
    }

    if (!transactionFound) {
      return NextResponse.json(
        {
          message:
            'No accepted transaction found for this property by this buyer.',
        },
        { status: 404 },
      )
    }

    const existingReview = await Review.findOne({
      property: propertyId,
      buyerEmail: buyerEmail,
    })

    if (existingReview) {
      return NextResponse.json(
        { message: 'You have already reviewed this property' },
        { status: 409 },
      )
    }

    const newReview = new Review({
      property: propertyId,
      propertyName: propertyName,
      originalPrice: originalPrice,
      negotiatedPrice: saleType === 'negotiation' ? finalPrice : undefined,
      sellerEmail: sellerEmail,
      buyerEmail: buyerEmail,
      buyerMessage: buyerMessage,
      rating: ratingNum,
    })

    await newReview.save()

    return NextResponse.json(
      { message: 'Review submitted successfully', review: newReview },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { message: 'Failed to submit review' },
      { status: 500 },
    )
  }
}
