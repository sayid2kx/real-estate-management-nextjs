import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectToMongoDB } from '@/lib/database'
import { authOptions } from '../../auth/[...nextauth]/route'
import Property from '@/app/models/properties'
import PropertyOwnership from '@/app/models/PropertyOwnership'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
import Buyer from '@/app/models/buyer'

export async function PUT(req) {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { requestId, requestType } = body

    if (!requestId || !requestType) {
      return NextResponse.json(
        { message: 'Missing required fields: requestId and requestType' },
        { status: 400 },
      )
    }

    const sellerEmail = session.user.email
    let requestToUpdate
    let propertyId
    let buyerEmail
    let purchasePrice
    let buyerInfo

    if (requestType === 'buy') {
      requestToUpdate = await BuyRequest.findOne({
        _id: requestId,
        sellerEmail,
        status: 'accepted',
      })
        .populate('property')
        .populate('buyer')

      if (requestToUpdate) {
        propertyId = requestToUpdate.property._id
        buyerEmail = requestToUpdate.buyerEmail
        purchasePrice = requestToUpdate.property.price
        buyerInfo = requestToUpdate.buyer
          ? {
              fullname: requestToUpdate.buyer.fullname || '',
              email: requestToUpdate.buyer.email || buyerEmail,
              phone: requestToUpdate.buyer.phone || '',
              username: requestToUpdate.buyer.username || '',
              address: requestToUpdate.buyer.address || '',
              country: requestToUpdate.buyer.country || '',
            }
          : {
              fullname: '',
              email: buyerEmail,
              phone: '',
              username: '',
              address: '',
              country: '',
            }
      }
    } else if (requestType === 'negotiation') {
      requestToUpdate = await Negotiation.findOne({
        _id: requestId,
        sellerEmail,
        status: 'accepted',
      })
        .populate('property')
        .populate('buyer')

      if (requestToUpdate) {
        propertyId = requestToUpdate.property._id
        buyerEmail = requestToUpdate.buyerEmail
        purchasePrice = requestToUpdate.offerPrice
        buyerInfo = requestToUpdate.buyer
          ? {
              fullname: requestToUpdate.buyer.fullname || 0,
              email: requestToUpdate.buyer.email || buyerEmail,
              phone: requestToUpdate.buyer.phone || '',
              username: requestToUpdate.buyer.username || '',
              address: requestToUpdate.buyer.address || '',
              country: requestToUpdate.buyer.country || '',
            }
          : {
              fullname: '',
              email: buyerEmail,
              phone: '',
              username: '',
              address: '',
              country: '',
            }
      }
    } else {
      return NextResponse.json(
        { message: 'Invalid request type: must be "buy" or "negotiation"' },
        { status: 400 },
      )
    }

    if (!requestToUpdate) {
      return NextResponse.json(
        { message: 'Request not found, not accepted, or unauthorized' },
        { status: 404 },
      )
    }

    const property = await Property.findById(propertyId)
    if (!property) {
      return NextResponse.json(
        { message: 'Property not found' },
        { status: 404 },
      )
    }

    const existingOwnership = await PropertyOwnership.findOne({
      property: propertyId,
      requestId: requestId,
    })

    if (existingOwnership) {
      return NextResponse.json(
        { message: 'Property has already been handed over for this request' },
        { status: 409 },
      )
    }

    const newOwnership = new PropertyOwnership({
      property: propertyId,
      currentOwner: buyerEmail,
      originalOwner: property.email,
      purchasePrice: purchasePrice,
      purchaseType: requestType,
      requestId: requestId,
      buyerInfo,
      status: 'active',
    })

    await newOwnership.save()

    requestToUpdate.status = 'finalized'
    await requestToUpdate.save()

    property.isAvailableForSale = false
    await property.save()

    return NextResponse.json(
      {
        message: `Property "${property.propertyTitle}" handover successful`,
        ownership: {
          id: newOwnership._id,
          property: propertyId,
          currentOwner: buyerEmail,
          originalOwner: property.email,
          purchasePrice: purchasePrice,
          purchaseDate: newOwnership.purchaseDate,
        },
        request: {
          id: requestToUpdate._id,
          status: requestToUpdate.status,
        },
        propertyUpdated: true,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error handling property handover:', error)
    return NextResponse.json(
      { message: 'Failed to handle property handover', error: error.message },
      { status: 500 },
    )
  }
}
