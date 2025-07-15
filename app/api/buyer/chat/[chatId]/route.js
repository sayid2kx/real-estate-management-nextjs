import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import Chat from '@/app/models/Chat'
import Message from '@/app/models/Message'
import Buyer from '@/app/models/buyer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request, { params }) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = params

    const currentUser = await Buyer.findOne({ email: session.user.email })

    if (!currentUser) {
      return NextResponse.json({ message: 'Buyer not found' }, { status: 404 })
    }
    const currentUserId = currentUser._id

    const chat = await Chat.findById(chatId)
      .populate('participants', 'username')
      .populate('property', 'propertyTitle')
      .lean()

    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 })
    }

    const isParticipant = chat.participants.some(
      (p) => p._id.toString() === currentUserId.toString(),
    )
    if (!isParticipant) {
      return NextResponse.json(
        { message: 'Unauthorized to access this chat' },
        { status: 401 },
      )
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ createdAt: 1 })
      .lean()

    const otherParticipant = chat.participants.find(
      (p) => p._id.toString() !== currentUserId.toString(),
    )
    const chatDetails = {
      ...chat,
      otherParticipantUsername: otherParticipant?.username || 'Other User',
    }

    return NextResponse.json(
      { chat: chatDetails, messages, currentUserId },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json(
      { message: 'Failed to fetch chat' },
      { status: 500 },
    )
  }
}
