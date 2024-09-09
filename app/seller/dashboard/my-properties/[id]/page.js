import { connectToMongoDB } from "@/lib/database";
import Property from "@/app/models/properties";
import SellerNavbarComp from "@/app/components/SellerNavbar";
import Image from "next/image";
import FooterSection from "@/app/components/Footer";

export default async function PropertyDetails({ params }) {
  const { id } = params;
  await connectToMongoDB();

  const property = await Property.findById(id);

  if (!property) {
    return <p>Property not found</p>;
  }

  return (
    <div>
      <SellerNavbarComp />
      <div className="min-h-screen bg-cyan-200 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <div className="relative w-full h-96 mb-8">
            {property.images.length > 0 ? (
              <Image
                src={property.images[0]}
                alt={property.propertyTitle}
                layout="fill"
                className="object-cover rounded-md"
              />
            ) : (
              <div className="bg-gray-200 w-full h-full rounded-md"></div>
            )}
          </div>
          <h1 className="text-4xl text-gray-600 font-bold mb-4">
            {property.propertyTitle}
          </h1>

          <div className="bg-gray-300 p-6 rounded-lg shadow-md mb-6">
            <p className="text-lg text-gray-700 mb-4">
              {property.propertyType} -{" "}
              <span className="font-semibold">
                {property.price.toLocaleString()} BDT
              </span>
            </p>
            <p className="text-gray-600 text-3xl mb-4">
              Description: {property.description}
            </p>
          </div>
          <div className="bg-gray-300 p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
              <p className="text-lg">
                <strong>Bedrooms:</strong> {property.bedrooms}
              </p>
              <p className="text-lg">
                <strong>Bathrooms:</strong> {property.bathrooms}
              </p>
              <p className="text-lg">
                <strong>Total Area:</strong> {property.totalArea} sqft
              </p>
              <p className="text-lg">
                <strong>Year Built:</strong> {property.yearBuilt}
              </p>
              <p className="text-lg">
                <strong>Address:</strong> {property.address}, {property.city}
              </p>
              <p className="text-lg">
                <strong>State/Province:</strong> {property.stateProvince}
              </p>
              <p className="text-lg">
                <strong>ZIP/Postal Code:</strong> {property.zipPostalCode}
              </p>
              <p className="text-lg">
                <strong>Country:</strong> {property.country}
              </p>
            </div>
          </div>

          <div className="bg-gray-300 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>CCTV:</strong> {property.amenities.cctv ? "Yes" : "No"}
              </li>
              <li>
                <strong>Gym:</strong> {property.amenities.gym ? "Yes" : "No"}
              </li>
              <li>
                <strong>Security:</strong>{" "}
                {property.amenities.security ? "Yes" : "No"}
              </li>
              <li>
                <strong>Pool:</strong> {property.amenities.pool ? "Yes" : "No"}
              </li>
            </ul>
            <p className="text-lg mt-5 mb-6">
              <strong>Parking Availability:</strong>{" "}
              {property.parkingAvailability}
            </p>
          </div>

          <div className="bg-gray-300 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p>
              <strong>Contact Name:</strong> {property.contactName}
            </p>
            <p>
              <strong>Email:</strong> {property.email}
            </p>
            <p>
              <strong>Phone:</strong> {property.phone}
            </p>
          </div>

          <div className="bg-gray-300 p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-600">
              <strong>Created At:</strong>{" "}
              {new Date(property.createdAt).toLocaleDateString()}{" "}
              <strong>Updated At:</strong>{" "}
              {new Date(property.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="h-20">
        <FooterSection />
      </div>
    </div>
  );
}
