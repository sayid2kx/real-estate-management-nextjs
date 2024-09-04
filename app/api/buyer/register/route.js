import { connectToMongoDB } from "@/lib/database";
import Buyer from "@/app/models/buyer";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { fullname, username, email, phone, password, address } =
      await req.json();

    if (!fullname || !username || !email || !phone || !password || !address) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    await connectToMongoDB();

    const hashedPassword = await bcrypt.hash(password, 10);

    await Buyer.create({
      fullname,
      username,
      email,
      phone,
      password: hashedPassword,
      address,
    });

    return NextResponse.json(
      { message: "Buyer registered successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the buyer." },
      { status: 500 }
    );
  }
}
