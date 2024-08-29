import { connectToMongoDB } from "@/lib/database";
import Buyer from "@/app/models/buyer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectToMongoDB();
    const { email } = await req.json();
    const user = await Buyer.findOne({ email }).select("_id");
    console.log("buyer: ", user);
    return NextResponse.json({ user });
  } catch (error) {
    console.error("Error checking buyer existence:", error);
    return NextResponse.json(
      { message: "An error occurred while checking buyer existence." },
      { status: 500 }
    );
  }
}
