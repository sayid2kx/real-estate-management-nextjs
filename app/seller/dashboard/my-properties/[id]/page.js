import { connectToMongoDB } from '@/lib/database'
import Property from '@/app/models/properties'
import SellerNavbarComp from '@/app/components/SellerNavbar'
import Image from 'next/image'
import FooterSection from '@/app/components/Footer'

export default async function PropertyDetails({ params }) {
  const { id } = params
  await connectToMongoDB()

  const property = await Property.findById(id)

  if (!property) {
    return <p>Property not found</p>
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-blue-50">
      <SellerNavbarComp />

      <div className="max-w-5xl mx-auto p-6 sm:p-8">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="relative w-full h-64 sm:h-96 mb-8">
            {property.image ? (
              <Image
                src={property.image}
                alt={property.propertyTitle}
                fill
                className="object-cover rounded-md"
              />
            ) : (
              <div className="bg-gray-200 w-full h-full rounded-md"></div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            {property.propertyTitle}
          </h1>

          <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
            <p className="text-lg sm:text-xl text-gray-700 mb-4">
              {property.propertyType} -{' '}
              <span className="font-semibold">
                {property.price.toLocaleString()} BDT
              </span>
            </p>
            <p className="text-lg sm:text-xl text-gray-700 mb-4">
              <strong>Description:</strong> {property.description}
            </p>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
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

          <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
            <ul className="list-disc pl-5 space-y-2 text-lg text-gray-700">
              <li>
                <strong>CCTV:</strong> {property.amenities.cctv ? 'Yes' : 'No'}
              </li>
              <li>
                <strong>Gym:</strong> {property.amenities.gym ? 'Yes' : 'No'}
              </li>
              <li>
                <strong>Security:</strong>{' '}
                {property.amenities.security ? 'Yes' : 'No'}
              </li>
              <li>
                <strong>Pool:</strong> {property.amenities.pool ? 'Yes' : 'No'}
              </li>
            </ul>
            <p className="text-lg mt-4">
              <strong>Parking Availability:</strong>{' '}
              {property.parkingAvailability}
            </p>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-lg text-gray-700">
              <strong>Contact Name:</strong> {property.contactName}
            </p>
            <p className="text-lg text-gray-700">
              <strong>Email:</strong> {property.email}
            </p>
            <p className="text-lg text-gray-700">
              <strong>Phone:</strong> {property.phone}
            </p>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <p className="text-lg text-gray-600">
              <strong>Created At:</strong>{' '}
              {new Date(property.createdAt).toLocaleDateString()}{' '}
              <strong>Updated At:</strong>{' '}
              {new Date(property.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  )
}
