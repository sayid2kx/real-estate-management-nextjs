import { connectToMongoDB } from '@/lib/database'
import Property from '@/app/models/properties'
import Buyer from '@/app/models/buyer'
import Seller from '@/app/models/seller'
import Chat from '@/app/models/Chat'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import mongoose from 'mongoose'

async function findOrCreateChatAndPopulate({ propertyId, buyerId, sellerId }) {
  let chat = await Chat.findOne({
    property: new mongoose.Types.ObjectId(propertyId),
    buyer: new mongoose.Types.ObjectId(buyerId),
    seller: new mongoose.Types.ObjectId(sellerId),
  })
    .populate('buyer', 'fullname email')
    .populate('seller', 'fullname email')
    .populate('property', 'propertyTitle image')

  if (!chat) {
    chat = new Chat({
      property: new mongoose.Types.ObjectId(propertyId),
      buyer: new mongoose.Types.ObjectId(buyerId),
      seller: new mongoose.Types.ObjectId(sellerId),
      messages: [],
    })
    await chat.save()

    chat = await Chat.findById(chat._id)
      .populate('buyer', 'fullname email')
      .populate('seller', 'fullname email')
      .populate('property', 'propertyTitle image')
  }

  return chat
}

export async function GET(req) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response(JSON.stringify({ message: 'User not authenticated' }), {
      status: 401,
    })
  }

  if (!session.user || !session.user.email) {
    return new Response(
      JSON.stringify({ message: 'User email not found in session' }),
      {
        status: 400,
      },
    )
  }

  await connectToMongoDB()

  try {
    const buyer = await Buyer.findOne({ email: session.user.email })
    if (!buyer) {
      return new Response(JSON.stringify({ message: 'Buyer not found' }), {
        status: 404,
      })
    }
    const buyerId = buyer._id

    const { searchParams } = new URL(req.url)
    const propertyId = searchParams.get('propertyId')

    if (propertyId) {
      if (!mongoose.Types.ObjectId.isValid(propertyId)) {
        return new Response(
          JSON.stringify({ message: 'Valid Property ID is required' }),
          {
            status: 400,
          },
        )
      }

      const property = await Property.findById(propertyId)
      if (!property) {
        return new Response(JSON.stringify({ message: 'Property not found' }), {
          status: 404,
        })
      }
      const sellerEmail = property.email

      const seller = await Seller.findOne({ email: sellerEmail })
      if (!seller) {
        return new Response(
          JSON.stringify({
            message: `Seller not found for email: ${sellerEmail}`,
          }),
          {
            status: 404,
          },
        )
      }
      const sellerId = seller._id

      const chat = await findOrCreateChatAndPopulate({
        propertyId,
        buyerId,
        sellerId,
      })

      return new Response(
        JSON.stringify({
          message: 'Specific chat fetched successfully',
          chat: chat,
          isSingleChat: true,
        }),
        { status: 200 },
      )
    } else {
      const allChats = await Chat.find({ buyer: buyerId })
        .populate('property', 'propertyTitle image')
        .populate('seller', 'fullname email')
        .sort({ updatedAt: -1 })

      return new Response(
        JSON.stringify({
          message: 'All chats fetched successfully',
          chats: allChats,
          isSingleChat: false,
        }),
        { status: 200 },
      )
    }
  } catch (error) {
    console.error('Error fetching chat(s):', error)
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    })
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response(JSON.stringify({ message: 'User not authenticated' }), {
      status: 401,
    })
  }

  const { propertyId, content } = await req.json()

  if (!propertyId || !content || !mongoose.Types.ObjectId.isValid(propertyId)) {
    return new Response(
      JSON.stringify({ message: 'Valid Property ID and content are required' }),
      {
        status: 400,
      },
    )
  }

  if (!session.user || !session.user.email) {
    return new Response(
      JSON.stringify({ message: 'User email not found in session' }),
      {
        status: 400,
      },
    )
  }

  await connectToMongoDB()

  try {
    const buyer = await Buyer.findOne({ email: session.user.email })
    if (!buyer) {
      return new Response(JSON.stringify({ message: 'Buyer not found' }), {
        status: 404,
      })
    }
    const buyerId = buyer._id

    const property = await Property.findById(propertyId)
    if (!property) {
      return new Response(JSON.stringify({ message: 'Property not found' }), {
        status: 404,
      })
    }
    const sellerEmail = property.email

    const seller = await Seller.findOne({ email: sellerEmail })
    if (!seller) {
      return new Response(
        JSON.stringify({
          message: `Seller not found for email: ${sellerEmail}`,
        }),
        {
          status: 404,
        },
      )
    }
    const sellerId = seller._id

    const newMessage = {
      sender: buyerId,
      senderModel: 'Buyer',
      content: content,
      timestamp: new Date(),
      _id: new mongoose.Types.ObjectId(),
    }

    const chat = await Chat.findOneAndUpdate(
      { property: propertyId, buyer: buyerId, seller: sellerId },
      {
        $push: { messages: newMessage },
        $setOnInsert: {
          property: propertyId,
          buyer: buyerId,
          seller: sellerId,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    )
      .populate('buyer', 'fullname email')
      .populate('seller', 'fullname email')
      .populate('property', 'propertyTitle')

    if (!chat) {
      return new Response(
        JSON.stringify({
          message: 'Failed to find or create chat after sending message.',
        }),
        {
          status: 500,
        },
      )
    }

    return new Response(
      JSON.stringify({
        message: 'Message sent successfully',
        newMessage: newMessage,
        chatId: chat._id.toString(),
      }),
      { status: 201 },
    )
  } catch (error) {
    console.error('Error sending message:', error)
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    })
  }
}
