import { connectToMongoDB } from "@/lib/database";
import Seller from "@/app/models/seller";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToMongoDB();
    const { email } = await req.json();
    const user = await Seller.findOne({ email }).select("_id");
    console.log("seller: ", user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error checking seller existence:", error);
    return NextResponse.json(
      { message: "An error occurred while checking seller existence." },
      { status: 500 }
    );
  }
}
