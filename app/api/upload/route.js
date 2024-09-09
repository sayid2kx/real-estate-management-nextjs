import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { connectToMongoDB } from "@/lib/database";
import Property from "@/app/models/properties";

export async function POST(request) {
  try {
    await connectToMongoDB();

    const data = await request.formData();
    const images = data.getAll("images");

    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, message: "No images uploaded" },
        { status: 400 }
      );
    }

    const imagePaths = [];

    for (const image of images) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const imageName = `${Date.now()}_${image.name}`;
      const imagePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        "properties",
        imageName
      );
      await writeFile(imagePath, buffer);
      imagePaths.push(`/uploads/properties/${imageName}`);
    }

    const propertyData = {
      propertyTitle: data.get("propertyTitle"),
      propertyType: data.get("propertyType"),
      price: data.get("price"),
      bedrooms: data.get("bedrooms"),
      bathrooms: data.get("bathrooms"),
      totalArea: data.get("totalArea"),
      address: data.get("address"),
      city: data.get("city"),
      stateProvince: data.get("stateProvince"),
      zipPostalCode: data.get("zipPostalCode"),
      country: data.get("country"),
      description: data.get("description"),
      yearBuilt: data.get("yearBuilt"),
      amenities: JSON.parse(data.get("amenities")),
      parkingAvailability: data.get("parkingAvailability"),
      contactName: data.get("contactName"),
      email: data.get("email"),
      phone: data.get("phone"),
      images: imagePaths,
    };

    const newProperty = new Property(propertyData);
    await newProperty.save();

    return NextResponse.json(
      { success: true, message: "Property added successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding property:", error);
    return NextResponse.json(
      { success: false, message: "Error adding property" },
      { status: 500 }
    );
  }
}
