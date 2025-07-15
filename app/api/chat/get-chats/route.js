import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToMongoDB } from '@/lib/database'
import { authOptions } from '../../auth/[...nextauth]/route'
import Chat from '@/app/models/Chat'
import Property from '@/app/models/properties'
import Seller from '@/app/models/seller'
import Buyer from '@/app/models/buyer'

export async function GET(req) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = session.user.email
    const userRole = session.user.role

    const queryField = userRole === 'seller' ? 'sellerEmail' : 'buyerEmail'

    const chats = await Chat.find({ [queryField]: userEmail })
      .sort({ lastMessageTime: -1 })
      .lean()

    const chatsWithDetails = await Promise.all(
      chats.map(async (chat) => {
        const property = await Property.findById(chat.propertyId)
          .select('propertyTitle image')
          .lean()

        const otherPartyEmail =
          userRole === 'seller' ? chat.buyerEmail : chat.sellerEmail

        let otherParty
        if (userRole === 'seller') {
          otherParty = await Buyer.findOne({ email: otherPartyEmail })
            .select('fullname image')
            .lean()
        } else {
          otherParty = await Seller.findOne({ email: otherPartyEmail })
            .select('fullname image')
            .lean()
        }

        return {
          ...chat,
          property: property || { propertyTitle: 'Unknown Property' },
          otherParty: otherParty || {
            fullname: otherPartyEmail,
            image: null,
          },
          unreadCount:
            userRole === 'seller' ? chat.unreadSeller : chat.unreadBuyer,
        }
      }),
    )

    return NextResponse.json({ chats: chatsWithDetails }, { status: 200 })
  } catch (error) {
    console.error('Get chats error:', error)
    return NextResponse.json(
      { message: 'Failed to fetch chats', error: error.message },
      { status: 500 },
    )
  }
}
