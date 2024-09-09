"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddNewProperty() {
  const [formData, setFormData] = useState({
    propertyTitle: "",
    propertyType: "House",
    price: "",
    bedrooms: "",
    bathrooms: "",
    totalArea: "",
    address: "",
    city: "",
    stateProvince: "",
    zipPostalCode: "",
    country: "Bangladesh",
    description: "",
    yearBuilt: "",
    amenities: {
      cctv: false,
      gym: false,
      security: false,
      pool: false,
    },
    parkingAvailability: "Yes",
    contactName: "",
    email: "",
    phone: "",
    images: null,
  });
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        amenities: { ...prev.amenities, [name]: checked },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, images: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    for (const key in formData) {
      if (key === "amenities") {
        formDataToSend.append(key, JSON.stringify(formData[key]));
      } else if (key === "images") {
        for (let i = 0; i < formData.images.length; i++) {
          formDataToSend.append("images", formData.images[i]);
        }
      } else {
        formDataToSend.append(key, formData[key]);
      }
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataToSend,
      });
      if (response.ok) {
        router.push("/seller/dashboard");
      } else {
        alert("Error adding property");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-200 py-10">
      <form onSubmit={handleSubmit} className="p-8 max-w-2xl mx-auto">
        <div className="mb-4">
          <label
            htmlFor="propertyTitle"
            className="block mb-2 text-lg font-medium"
          >
            Property Title
          </label>
          <input
            type="text"
            id="propertyTitle"
            name="propertyTitle"
            placeholder="Property Title"
            value={formData.propertyTitle}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="propertyType"
            className="block mb-2 text-lg font-medium"
          >
            Property Type
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          >
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block mb-2 text-lg font-medium">
            Price
          </label>
          <input
            type="number"
            id="price"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          />
        </div>
        <div className="flex mb-4">
          <div className="w-1/2 mr-4">
            <label
              htmlFor="bedrooms"
              className="block mb-2 text-lg font-medium"
            >
              Bedrooms
            </label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              placeholder="Bedrooms No."
              value={formData.bedrooms}
              onChange={handleChange}
              required
              className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
            />
          </div>
          <div className="w-1/2">
            <label
              htmlFor="bathrooms"
              className="block mb-2 text-lg font-medium"
            >
              Bathrooms
            </label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              placeholder="Bathrooms No."
              value={formData.bathrooms}
              onChange={handleChange}
              required
              className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="totalArea" className="block mb-2 text-lg font-medium">
            Total Area (sq ft)
          </label>
          <input
            type="number"
            id="totalArea"
            name="totalArea"
            placeholder="Total Area"
            value={formData.totalArea}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="address" className="block mb-2 text-lg font-medium">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          />
        </div>
        <div className="flex mb-4">
          <div className="w-1/3 mr-4">
            <label htmlFor="city" className="block mb-2 text-lg font-medium">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
              className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
            />
          </div>
          <div className="w-1/3 mr-4">
            <label
              htmlFor="stateProvince"
              className="block mb-2 text-lg font-medium"
            >
              State/Province
            </label>
            <input
              type="text"
              id="stateProvince"
              name="stateProvince"
              placeholder="State"
              value={formData.stateProvince}
              onChange={handleChange}
              required
              className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
            />
          </div>
          <div className="w-1/3">
            <label
              htmlFor="zipPostalCode"
              className="block mb-2 text-lg font-medium"
            >
              ZIP/Postal Code
            </label>
            <input
              type="number"
              id="zipPostalCode"
              name="zipPostalCode"
              placeholder="Zip Code"
              value={formData.zipPostalCode}
              onChange={handleChange}
              required
              className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
            />
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="country" className="block mb-2 text-lg font-medium">
            Country
          </label>
          <select
            type="text"
            id="country"
            name="country"
            placeholder="Country"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          >
            <option value="Bangladesh">Bangladesh</option>
            <option value="India">India</option>
            <option value="Pakistan">Pakistan</option>
            <option value="Nepal">Nepal</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block mb-2 text-lg font-medium"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            placeholder="Property description"
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="yearBuilt" className="block mb-2 text-lg font-medium">
            Year Built
          </label>
          <input
            type="number"
            id="yearBuilt"
            name="yearBuilt"
            placeholder="Year"
            value={formData.yearBuilt}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-100 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Amenities
          </label>
          <div className="grid grid-cols-2 gap-4">
            {" "}
            {/* Grid layout for amenities */}
            {["cctv", "gym", "security", "pool"].map((amenity) => (
              <div key={amenity} className="flex items-center">
                <input
                  type="checkbox"
                  id={amenity}
                  name={amenity}
                  checked={formData.amenities[amenity]}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor={amenity}
                  className="ml-2 text-sm text-gray-700 uppercase"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="parkingAvailability"
            className="block mb-2 text-lg font-medium"
          >
            Parking Availability
          </label>
          <select
            id="parkingAvailability"
            name="parkingAvailability"
            value={formData.parkingAvailability}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="contactName"
            className="block mb-2 text-lg font-medium"
          >
            Contact Name
          </label>
          <input
            type="text"
            id="contactName"
            name="contactName"
            placeholder="Contact Name"
            value={formData.contactName}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-lg font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Contact Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phone" className="block mb-2 text-lg font-medium">
            Phone
          </label>
          <input
            type="text"
            id="phone"
            name="phone"
            placeholder="Contact Phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="images" className="block mb-2 text-lg font-medium">
            Upload Images
          </label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            onChange={handleImageChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-md hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
