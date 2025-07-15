import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToMongoDB } from '@/lib/database'
import { authOptions } from '../../auth/[...nextauth]/route'
import Chat from '@/app/models/Chat'
import Property from '@/app/models/properties'

export async function POST(req) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { propertyId, sellerEmail } = body

    if (!propertyId || !sellerEmail) {
      return NextResponse.json(
        { message: 'Property ID and seller email are required' },
        { status: 400 },
      )
    }

    const buyerEmail = session.user.email

    const property = await Property.findById(propertyId)
    if (!property) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 },
      )
    }

    let chat = await Chat.findOne({
      propertyId,
      buyerEmail,
      sellerEmail,
    })

    if (!chat) {
      chat = new Chat({
        propertyId,
        buyerEmail,
        sellerEmail,
        lastMessage: '',
        lastMessageTime: new Date(),
      })
      await chat.save()
    }

    return NextResponse.json({ chatId: chat._id }, { status: 200 })
  } catch (error) {
    console.error('Chat initialization error:', error)
    return NextResponse.json(
      { message: 'Failed to initialize chat', error: error.message },
      { status: 500 },
    )
  }
}
