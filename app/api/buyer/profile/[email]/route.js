import { connectToMongoDB } from "@/lib/database";
import Buyer from "@/app/models/buyer";

export async function GET(req, { params }) {
  const { email } = params;

  await connectToMongoDB();

  try {
    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return new Response(JSON.stringify({ message: "Seller not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(buyer), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
    });
  }
}
