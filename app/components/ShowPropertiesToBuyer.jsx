"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const AllPropertiesShowToBuyer = () => {
  const [properties, setProperties] = useState([]);
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [propertyType, setPropertyType] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (sort = null, order = "asc", type = null) => {
    try {
      let url = "/api/buyer/allproperties";
      const params = new URLSearchParams();
      if (sort) params.append("sortBy", sort);
      if (order) params.append("order", order);
      if (type) params.append("propertyType", type);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
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

  const handleSort = (field) => {
    let newOrder = "asc";
    if (field === sortBy) {
      newOrder = sortOrder === "asc" ? "desc" : "asc";
    }
    setSortBy(field);
    setSortOrder(newOrder);
    fetchProperties(field, newOrder, propertyType);
  };

  const handlePropertyTypeFilter = (type) => {
    setPropertyType(type === propertyType ? null : type);
    fetchProperties(sortBy, sortOrder, type === propertyType ? null : type);
  };

  if (properties.length === 0) {
    return <p className="text-center text-xl mt-4">No properties found</p>;
  }

  return (
    <div className="p-4">
      <div className="mb-4 space-x-2">
        <button
          onClick={() => handleSort("price")}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Sort by Price{" "}
          {sortBy === "price" &&
            (sortOrder === "asc" ? "(Low to High)" : "(High to Low)")}
        </button>
        <button
          onClick={() => handlePropertyTypeFilter("House")}
          className={`px-3 py-1 ${
            propertyType === "House" ? "bg-green-500" : "bg-gray-400"
          } text-white rounded`}
        >
          Houses
        </button>
        <button
          onClick={() => handlePropertyTypeFilter("Apartment")}
          className={`px-3 py-1 ${
            propertyType === "Apartment" ? "bg-green-500" : "bg-gray-400"
          } text-white rounded`}
        >
          Apartments
        </button>
      </div>
      <ul className="space-y-8">
        {properties.map((property) => (
          <li
            key={property._id}
            className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col md:flex-row"
          >
            <Link
              href={`/buyer/dashboard/${property._id}`}
              className="w-full md:w-1/3"
            >
              <div className="relative h-48 md:h-full cursor-pointer">
                {property.image ? (
                  <Image
                    src={property.image}
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

export default AllPropertiesShowToBuyer;
