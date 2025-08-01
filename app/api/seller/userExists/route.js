import { connectToMongoDB } from '@/lib/database'
import Buyer from '@/app/models/buyer'
import Seller from '@/app/models/seller'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    await connectToMongoDB()
    const { email, username } = await req.json()

    // Check for existing user in Seller collection
    const seller = await Seller.findOne({
      $or: [{ email }, { username }],
    }).select('_id email username')

    // Check for existing user in Buyer collection
    const buyer = await Buyer.findOne({
      $or: [{ email }, { username }],
    }).select('_id email username')

    if (seller || buyer) {
      const user = seller || buyer
      const role = seller ? 'seller' : 'buyer'
      return NextResponse.json({ user: { ...user._doc, role } })
    }

    return NextResponse.json(
      { message: 'No user found with the provided email or username.' },
      { status: 404 },
    )
  } catch (error) {
    console.error('Error checking user existence:', error)
    return NextResponse.json(
      { message: 'An error occurred while checking user existence.' },
      { status: 500 },
    )
  }
}
