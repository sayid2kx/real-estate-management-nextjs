import { connectToMongoDB } from '@/lib/database'
import Property from '@/app/models/properties'
import Division from '@/app/models/Division'
import District from '@/app/models/District'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import Buyer from '@/app/models/buyer'
import PropertyOwnership from '@/app/models/PropertyOwnership'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req, res) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return new Response(JSON.stringify({ message: 'User not authenticated' }), {
      status: 401,
    })
  }

  const { email } = session.user

  await connectToMongoDB()

  try {
    const properties = await Property.find({ email })
      .populate('district')
      .exec()

    if (properties.length === 0) {
      return new Response(JSON.stringify({ message: 'No properties found' }), {
        status: 404,
      })
    }

    const divisions = await Division.find().lean().exec()

    const propertyIds = properties.map((p) => p._id)

    const acceptedBuyRequests = await BuyRequest.find({
      property: { $in: propertyIds },
      status: 'accepted',
    })
      .lean()
      .exec()

    const finalizedBuyRequests = await BuyRequest.find({
      property: { $in: propertyIds },
      status: 'finalized',
    })
      .lean()
      .exec()

    const acceptedNegotiations = await Negotiation.find({
      property: { $in: propertyIds },
      status: 'accepted',
    })
      .lean()
      .exec()

    const finalizedNegotiations = await Negotiation.find({
      property: { $in: propertyIds },
      status: 'finalized',
    })
      .lean()
      .exec()

    const ownershipRecords = await PropertyOwnership.find({
      property: { $in: propertyIds },
      status: 'active',
    })
      .lean()
      .exec()

    const buyerEmails = new Set([
      ...acceptedBuyRequests.map((request) => request.buyerEmail),
      ...finalizedBuyRequests.map((request) => request.buyerEmail),
      ...acceptedNegotiations.map((negotiation) => negotiation.buyerEmail),
      ...finalizedNegotiations.map((negotiation) => negotiation.buyerEmail),
    ])

    const buyers = await Buyer.find({
      email: { $in: Array.from(buyerEmails) },
    })
      .lean()
      .exec()

    const buyerMap = {}
    buyers.forEach((buyer) => {
      buyerMap[buyer.email] = buyer.fullname
    })

    const soldPropertiesMap = {}

    acceptedBuyRequests.forEach((request) => {
      soldPropertiesMap[request.property.toString()] = {
        buyerEmail: request.buyerEmail,
        buyerName: buyerMap[request.buyerEmail] || 'Unknown Buyer',
        soldDate: request.updatedAt,
        saleType: 'direct',
        originalPrice: null,
      }
    })

    finalizedBuyRequests.forEach((request) => {
      soldPropertiesMap[request.property.toString()] = {
        buyerEmail: request.buyerEmail,
        buyerName: buyerMap[request.buyerEmail] || 'Unknown Buyer',
        soldDate: request.updatedAt,
        saleType: 'direct',
        originalPrice: null,
        isFinalized: true,
      }
    })

    acceptedNegotiations.forEach((negotiation) => {
      soldPropertiesMap[negotiation.property.toString()] = {
        buyerEmail: negotiation.buyerEmail,
        buyerName: buyerMap[negotiation.buyerEmail] || 'Unknown Buyer',
        soldDate: negotiation.updatedAt,
        saleType: 'negotiated',
        negotiatedPrice: negotiation.offerPrice,
        originalPrice: null,
      }
    })

    finalizedNegotiations.forEach((negotiation) => {
      soldPropertiesMap[negotiation.property.toString()] = {
        buyerEmail: negotiation.buyerEmail,
        buyerName: buyerMap[negotiation.buyerEmail] || 'Unknown Buyer',
        soldDate: negotiation.updatedAt,
        saleType: 'negotiated',
        negotiatedPrice: negotiation.offerPrice,
        originalPrice: null,
        isFinalized: true,
      }
    })

    ownershipRecords.forEach((ownership) => {
      soldPropertiesMap[ownership.property.toString()] = {
        ...soldPropertiesMap[ownership.property.toString()],
        buyerEmail: ownership.buyerInfo.email,
        buyerName: ownership.buyerInfo.fullname || 'Unknown Buyer',
        soldDate: ownership.purchaseDate,
        saleType: ownership.purchaseType === 'buy' ? 'direct' : 'negotiated',
        negotiatedPrice:
          ownership.purchaseType === 'negotiation'
            ? ownership.purchasePrice
            : undefined,
        originalPrice: null,
        isFinalized: true,
      }
    })

    const propertiesWithDetails = properties.map((property) => {
      const propertyId = property._id.toString()
      const division = divisions.find(
        (d) => d._id.toString() === property.division.toString(),
      )

      const soldInfo = soldPropertiesMap[propertyId]
      const isSold = !!soldInfo
      const isFinalized = soldInfo?.isFinalized || false

      if (isSold) {
        soldInfo.originalPrice = property.price
      }

      return {
        ...property.toObject(),
        division: division ? { name: division.name } : { name: 'N/A' },
        isSold,
        isFinalized,
        ...(isSold && {
          buyerEmail: soldInfo.buyerEmail,
          buyerName: soldInfo.buyerName,
          soldDate: soldInfo.soldDate,
          saleType: soldInfo.saleType,
          negotiatedPrice: soldInfo.negotiatedPrice,
          originalPrice: soldInfo.originalPrice,
        }),
      }
    })

    return new Response(JSON.stringify(propertiesWithDetails), { status: 200 })
  } catch (error) {
    console.error('Error fetching properties:', error)
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    })
  }
}
