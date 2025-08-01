import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import PropertyOwnership from '@/app/models/PropertyOwnership'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request, { params }) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized: User not authenticated' },
        { status: 401 },
      )
    }

    const { propertyId } = params
    const buyerEmail = session.user.email

    if (!propertyId) {
      return NextResponse.json(
        { message: 'Property ID is required' },
        { status: 400 },
      )
    }

    const ownership = await PropertyOwnership.findOne({
      property: propertyId,
      currentOwner: buyerEmail,
    }).lean()

    return NextResponse.json({ isOwner: !!ownership }, { status: 200 })
  } catch (error) {
    console.error('Error checking ownership:', error)
    return NextResponse.json(
      { message: `Failed to check ownership: ${error.message}` },
      { status: 500 },
    )
  }
}
