// app/api/auth/buyer/route.js
import { connectToMongoDB } from "@/lib/database";
import Buyer from "@/app/models/buyer";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { fullname, email, phone, password, address } = await req.json();

    if (!fullname || !email || !phone || !password || !address) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectToMongoDB();

    // Check if user already exists
    const existingUser = await Buyer.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user record
    await Buyer.create({
      fullname,
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
