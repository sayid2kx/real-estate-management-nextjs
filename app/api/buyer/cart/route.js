import { NextResponse } from 'next/server'
import { connectToMongoDB } from '@/lib/database'
import Cart from '@/app/models/Cart'
import Property from '@/app/models/properties'
import District from '@/app/models/District'
import Division from '@/app/models/Division'
import BuyRequest from '@/app/models/BuyRequest'
import Negotiation from '@/app/models/Negotiation'
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

    const existingCart = await Cart.findOne({ buyerEmail: session.user.email })

    const isAlreadyInCart = existingCart?.items.some(
      (item) => item.property.toString() === propertyId,
    )

    if (isAlreadyInCart) {
      return NextResponse.json(
        { message: 'Property already added to the cart' },
        { status: 409 },
      )
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { buyerEmail: session.user.email },
      { $push: { items: { property: propertyId } } },
      { new: true, upsert: true },
    )

    return NextResponse.json(
      { message: 'Added to cart successfully', cart: updatedCart },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error adding to cart:', error)
    return NextResponse.json(
      { message: 'Failed to add to cart' },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    await connectToMongoDB()
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const buyerEmail = session.user.email

    // Fetch cart and populate property
    const cart = await Cart.findOne({ buyerEmail })
      .populate('items.property')
      .lean()

    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ cart: { items: [] } }, { status: 200 })
    }

    const divisions = await Division.find().lean()

    const filteredItems = await Promise.all(
      cart.items.map(async (item) => {
        if (!item.property) return null

        const propertyId = item.property._id

        const buyRequest = await BuyRequest.findOne({
          buyerEmail,
          property: propertyId,
          status: { $in: ['accepted', 'finalized'] },
        })

        const negotiationRequest = await Negotiation.findOne({
          buyerEmail,
          property: propertyId,
          status: { $in: ['accepted', 'finalized'] },
        })

        if (buyRequest || negotiationRequest) return null

        const district = await District.findById(item.property.district).lean()
        const division = divisions.find(
          (div) => div._id.toString() === item.property.division?.toString(),
        )

        return {
          ...item,
          property: {
            ...item.property,
            district: district ? { name: district.name } : { name: 'N/A' },
            division: division ? { name: division.name } : { name: 'N/A' },
          },
        }
      }),
    )

    const enrichedItems = filteredItems.filter(Boolean)

    return NextResponse.json(
      { cart: { ...cart, items: enrichedItems } },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching cart:', error)
    return NextResponse.json(
      { message: 'Failed to fetch cart' },
      { status: 500 },
    )
  }
}

export async function DELETE(request) {
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

    const cart = await Cart.findOneAndUpdate(
      { buyerEmail: session.user.email },
      { $pull: { items: { property: propertyId } } },
      { new: true },
    )

    if (!cart) {
      return NextResponse.json({ message: 'Cart not found' }, { status: 404 })
    }

    return NextResponse.json(
      { message: 'Removed from cart', cart },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json(
      { message: 'Failed to remove item from cart' },
      { status: 500 },
    )
  }
}
