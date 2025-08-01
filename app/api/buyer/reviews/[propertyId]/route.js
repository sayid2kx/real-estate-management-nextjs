import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import Review from '@/app/models/review'
import Buyer from '@/app/models/buyer'

export async function GET(request, { params }) {
  try {
    await connectToMongoDB()
    const { propertyId } = params

    if (!propertyId) {
      return NextResponse.json(
        { message: 'Property ID is required' },
        { status: 400 },
      )
    }

    const reviews = await Review.find({ property: propertyId })
      .sort({ createdAt: -1 })
      .lean()

    const reviewsWithBuyerNames = await Promise.all(
      reviews.map(async (review) => {
        const buyer = await Buyer.findOne({ email: review.buyerEmail })
          .select('fullname')
          .lean()
        return {
          ...review,
          buyerName: buyer ? buyer.fullname : 'Unknown Buyer',
          canEdit: true, // Always allow edit in this simplified version
        }
      }),
    )

    return NextResponse.json(
      { success: true, reviews: reviewsWithBuyerNames },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { message: 'Failed to fetch reviews' },
      { status: 500 },
    )
  }
}
