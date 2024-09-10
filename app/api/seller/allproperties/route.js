import { connectToMongoDB } from "@/lib/database";
import Property from "@/app/models/properties";

export async function GET(request) {
  await connectToMongoDB();

  const { searchParams } = new URL(request.url);
  const sortBy = searchParams.get("sortBy");
  const order = searchParams.get("order");
  const propertyType = searchParams.get("propertyType");

  try {
    let query = Property.find();

    if (propertyType) {
      query = query.where("propertyType").equals(propertyType);
    }

    if (sortBy && order) {
      const sortOrder = order === "asc" ? 1 : -1;
      query = query.sort({ [sortBy]: sortOrder });
    }

    const properties = await query.exec();

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
