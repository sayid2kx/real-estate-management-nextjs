import { connectToMongoDB } from "@/lib/database";
import Seller from "@/app/models/seller";
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

    const existingUserEmail = await Seller.findOne({ email });
    if (existingUserEmail) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 400 }
      );
    }

    const existingUsername = await Seller.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { message: "Username already registered." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Seller.create({
      fullname,
      username,
      email,
      phone,
      password: hashedPassword,
      address,
    });

    return NextResponse.json(
      { message: "Seller registered successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the seller." },
      { status: 500 }
    );
  }
}
