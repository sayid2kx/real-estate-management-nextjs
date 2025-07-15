import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { connectToMongoDB } from '@/lib/database'
import { authOptions } from '../../../auth/[...nextauth]/route'
import Chat from '@/app/models/Chat'
import Message from '@/app/models/Message'

export async function POST(req, { params }) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { chatId } = params

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ message: 'Invalid chat ID' }, { status: 400 })
    }

    const body = await req.json().catch(() => ({}))
    const { content } = body

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { message: 'Message content is required' },
        { status: 400 },
      )
    }

    const userEmail = session.user.email
    const userRole = session.user.role

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 })
    }

    if (chat.buyerEmail !== userEmail && chat.sellerEmail !== userEmail) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    const message = new Message({
      chatId,
      sender: userEmail,
      content,
      isRead: false,
    })

    await message.save()

    const unreadField = userRole === 'buyer' ? 'unreadSeller' : 'unreadBuyer'
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: content,
      lastMessageTime: new Date(),
      $inc: { [unreadField]: 1 },
    })

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        messageData: message,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { message: 'Failed to send message', error: error.message },
      { status: 500 },
    )
  }
}
