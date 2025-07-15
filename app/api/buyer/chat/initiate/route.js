import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import Chat from '@/app/models/Chat'
import Property from '@/app/models/properties'
import Seller from '@/app/models/seller'
import Buyer from '@/app/models/buyer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { propertyId } = await request.json()

    if (!propertyId) {
      return NextResponse.json(
        { message: 'Property ID is required' },
        { status: 400 },
      )
    }

    const property = await Property.findById(propertyId)

    if (!property) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 },
      )
    }

    const sellerEmail = property.email

    const buyer = await Buyer.findOne({ email: session.user.email })
    const seller = await Seller.findOne({ email: sellerEmail })

    if (!buyer) {
      console.error(`Buyer not found for email: ${session.user.email}`)
      return NextResponse.json({ message: 'Buyer not found' }, { status: 404 })
    }
    if (!seller) {
      console.error(`Seller not found for email: ${sellerEmail}`)
      return NextResponse.json(
        { message: 'Seller not found for property' },
        { status: 404 },
      )
    }

    const buyerId = buyer._id
    const sellerId = seller._id

    let chat = await Chat.findOne({
      participants: { $all: [buyerId, sellerId] },
    })

    if (chat) {
      return NextResponse.json({ chatId: chat._id }, { status: 200 })
    } else {
      const newChat = new Chat({
        participants: [buyerId, sellerId],
        property: propertyId,
      })
      await newChat.save()
      return NextResponse.json({ chatId: newChat._id }, { status: 201 })
    }
  } catch (error) {
    console.error('Error initiating chat:', error)
    return NextResponse.json(
      { message: 'Failed to initiate chat due to server error' },
      { status: 500 },
    )
  }
}
