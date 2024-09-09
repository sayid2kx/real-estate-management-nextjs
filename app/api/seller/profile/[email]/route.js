import { connectToMongoDB } from "@/lib/database";
import Seller from "@/app/models/seller";

export async function GET(req, { params }) {
  const { email } = params;

  await connectToMongoDB();

  try {
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return new Response(JSON.stringify({ message: "Seller not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(seller), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
