import { connectToMongoDB } from "@/lib/database";
import Property from "@/app/models/properties";

export async function GET() {
  await connectToMongoDB();

  try {
    const properties = await Property.find();
    if (properties.length === 0) {
      return new Response(JSON.stringify({ message: "No properties found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(properties), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
