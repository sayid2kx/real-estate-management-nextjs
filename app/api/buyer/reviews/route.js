import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import Review from '@/app/models/review'
import PropertyOwnership from '@/app/models/PropertyOwnership'
import Property from '@/app/models/properties'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized: User not authenticated' },
        { status: 401 },
      )
    }

    const buyerEmail = session.user.email
    const { propertyId, buyerMessage, rating } = await request.json()

    // Validate inputs
    if (!propertyId || !buyerMessage || rating == null) {
      return NextResponse.json(
        {
          message:
            'Missing required fields: propertyId, buyerMessage, and rating are required',
        },
        { status: 400 },
      )
    }

    const ratingNum = Number(rating)
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { message: 'Invalid rating: Must be a number between 1 and 5' },
        { status: 400 },
      )
    }

    // Verify property ownership
    const ownership = await PropertyOwnership.findOne({
      property: propertyId,
      currentOwner: buyerEmail,
    }).lean()

    if (!ownership) {
      return NextResponse.json(
        { message: 'Unauthorized: You do not own this property' },
        { status: 403 },
      )
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      property: propertyId,
      buyerEmail,
    })

    if (existingReview) {
      return NextResponse.json(
        {
          message:
            'Conflict: You have already submitted a review for this property',
        },
        { status: 409 },
      )
    }

    // Get property details
    const property = await Property.findById(propertyId)
      .select('propertyTitle email')
      .lean()

    if (!property) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 },
      )
    }

    // Create new review
    const newReview = new Review({
      property: propertyId,
      propertyName: property.propertyTitle,
      sellerEmail: property.email,
      buyerEmail,
      buyerMessage,
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
      { message: `Failed to submit review: ${error.message}` },
      { status: 500 },
    )
  }
}
