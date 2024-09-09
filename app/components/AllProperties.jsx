"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const AllPropertiesShow = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await fetch("/api/seller/allproperties");
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
  }, []);

  if (properties.length === 0) {
    return <p className="text-center text-xl mt-4">No properties found</p>;
  }

  return (
    <div className="p-4">
      <ul className="space-y-8">
        {properties.map((property) => (
          <li
            key={property._id}
            className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col md:flex-row"
          >
            <Link
              href={`/seller/dashboard/all-properties/${property._id}`}
              className="w-full md:w-1/3"
            >
              <div className="relative h-48 md:h-full cursor-pointer">
                {property.images.length > 0 ? (
                  <Image
                    src={property.images[0]}
                    alt={property.propertyTitle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full"></div>
                )}
              </div>
            </Link>
            <div className="w-full md:w-2/3 p-6">
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

export default AllPropertiesShow;
