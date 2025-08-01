import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import Review from '@/app/models/review'
import PropertyOwnership from '@/app/models/PropertyOwnership'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PUT(request) {
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
    const { propertyId, buyerMessage } = await request.json()

    // Validate inputs
    if (!propertyId || !buyerMessage) {
      return NextResponse.json(
        {
          message:
            'Missing required fields: propertyId and buyerMessage are required',
        },
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

    // Find and update review
    const existingReview = await Review.findOneAndUpdate(
      { property: propertyId, buyerEmail },
      { buyerMessage },
      { new: true },
    )

    if (!existingReview) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Review updated successfully', review: existingReview },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json(
      { message: `Failed to update review: ${error.message}` },
      { status: 500 },
    )
  }
}
