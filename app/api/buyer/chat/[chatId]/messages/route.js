import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import Chat from '@/app/models/Chat'
import Message from '@/app/models/Message'
import Buyer from '@/app/models/buyer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(request, { params }) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = params
    const { content } = await request.json()

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { message: 'Message content cannot be empty' },
        { status: 400 },
      )
    }

    const currentUser = await Buyer.findOne({ email: session.user.email })

    if (!currentUser) {
      return NextResponse.json({ message: 'Buyer not found' }, { status: 404 })
    }
    const currentUserId = currentUser._id

    const chat = await Chat.findById(chatId)

    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 })
    }

    const isParticipant = chat.participants.some(
      (p) => p.toString() === currentUserId.toString(),
    )
    if (!isParticipant) {
      return NextResponse.json(
        { message: 'Unauthorized to send message in this chat' },
        { status: 401 },
      )
    }

    const newMessage = new Message({
      chat: chatId,
      sender: currentUserId,
      content: content.trim(),
    })

    await newMessage.save()

    chat.lastMessageAt = new Date()
    await chat.save()

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'username')
      .lean()

    return NextResponse.json(
      { message: 'Message sent', newMessage: populatedMessage },
      { status: 201 },
    )
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { message: 'Failed to send message' },
      { status: 500 },
    )
  }
}
