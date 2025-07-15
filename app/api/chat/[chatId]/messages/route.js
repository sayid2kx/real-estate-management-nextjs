import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import mongoose from 'mongoose'
import { connectToMongoDB } from '@/lib/database'
import { authOptions } from '../../../auth/[...nextauth]/route'
import Chat from '@/app/models/Chat'
import Message from '@/app/models/Message'

export async function GET(req, { params }) {
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

    const userEmail = session.user.email
    const userRole = session.user.role

    const chat = await Chat.findById(chatId)
    if (!chat) {
      return NextResponse.json({ message: 'Chat not found' }, { status: 404 })
    }

    if (chat.buyerEmail !== userEmail && chat.sellerEmail !== userEmail) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 })
      .lean()

    if (messages.length > 0) {
      const unreadField = userRole === 'buyer' ? 'unreadBuyer' : 'unreadSeller'
      await Chat.findByIdAndUpdate(chatId, { [unreadField]: 0 })

      await Message.updateMany(
        {
          chatId,
          sender: userRole === 'buyer' ? chat.sellerEmail : chat.buyerEmail,
          isRead: false,
        },
        { isRead: true },
      )
    }

    return NextResponse.json({ messages }, { status: 200 })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch messages', error: error.message },
      { status: 500 },
    )
  }
}
