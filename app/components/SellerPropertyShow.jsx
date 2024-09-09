"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";

const SellerPropertyShow = () => {
  const { data: session, status } = useSession();
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (session?.user) {
      const fetchProperties = async () => {
        try {
          const encodedEmail = encodeURIComponent(session.user.email);
          const res = await fetch(`/api/seller/property/${encodedEmail}`);
          if (res.ok) {
            const data = await res.json();
            setProperties(data);
          } else {
            console.error("Error fetching properties", res.status);
          }
        } catch (error) {
          console.error("Failed to fetch properties:", error);
        }
      };
      fetchProperties();
    }
  }, [session]);

  if (status === "loading") {
    return <p className="text-center mt-4">Loading...</p>;
  }

  if (properties.length === 0) {
    return <p className="text-center mt-4">No properties found</p>;
  }

  return (
    <div>
      <ul className="space-y-8">
        {properties.map((property) => (
          <li
            key={property._id}
            className="flex bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            <div className="relative w-1/3 h-72">
              {property.images.length > 0 ? (
                <Image
                  src={property.images[0]}
                  alt={property.propertyTitle}
                  layout="fill"
                  className="object-cover"
                />
              ) : (
                <div className="bg-gray-200 w-full h-full"></div>
              )}
            </div>
            <div className="w-2/3 p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {property.propertyTitle}
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {property.propertyType} -{" "}
                <span className="font-semibold">
                  {property.price.toLocaleString()} BDT
                </span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {property.address}, {property.city}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <p>
                  <strong>Bedrooms:</strong> {property.bedrooms}
                </p>
                <p>
                  <strong>Bathrooms:</strong> {property.bathrooms}
                </p>
                <p>
                  <strong>Total Area:</strong> {property.totalArea} sqft
                </p>
                <p>
                  <strong>Year Built:</strong> {property.yearBuilt}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SellerPropertyShow;
