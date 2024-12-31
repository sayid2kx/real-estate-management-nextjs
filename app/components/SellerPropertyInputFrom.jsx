'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function AddNewProperty() {
  const [formData, setFormData] = useState({
    propertyTitle: '',
    propertyType: 'House',
    price: '',
    bedrooms: '',
    bathrooms: '',
    totalArea: '',
    address: '',
    division: '',
    district: '',
    zipPostalCode: '',
    description: '',
    yearBuilt: '',
    amenities: {
      cctv: false,
      gym: false,
      security: false,
      pool: false,
    },
    parkingAvailability: 'Yes',
    contactName: '',
    email: '',
    phone: '',
    image: null,
  })

  const [divisions, setDivisions] = useState([])
  const [allDistricts, setAllDistricts] = useState([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const divisionsResponse = await fetch('/api/seller/division')
        const divisionsData = await divisionsResponse.json()
        setDivisions(divisionsData)

        const districtsResponse = await fetch('/api/seller/district')
        const districtsData = await districtsResponse.json()
        setAllDistricts(districtsData)
      } catch (error) {
        setError(error.message)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchSellerDetails = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(
            `/api/seller/info?email=${session.user.email}`,
          )
          if (response.ok) {
            const sellerData = await response.json()
            setFormData((prev) => ({
              ...prev,
              contactName: sellerData.fullname,
              email: sellerData.email,
              phone: sellerData.phone,
            }))
          } else {
            console.error('Failed to fetch seller details')
          }
        } catch (error) {
          console.error('Error fetching seller details:', error)
        }
      }
    }

    fetchSellerDetails()
  }, [session])

  const filteredDistricts = allDistricts.filter(
    (district) => district.division === formData.division,
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        amenities: { ...prev.amenities, [name]: checked },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.division || !formData.district) {
      setError('Please select both division and district.')
      setLoading(false)
      return
    }

    const formDataToSend = new FormData()
    for (const key in formData) {
      if (key === 'amenities') {
        formDataToSend.append(key, JSON.stringify(formData[key]))
      } else if (key === 'image' && formData[key]) {
        formDataToSend.append(key, formData[key])
      } else {
        formDataToSend.append(key, formData[key])
      }
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      })
      if (!response.ok) throw new Error('Failed to add property')
      router.push('/seller/dashboard')
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-blue-200 py-10">
      <form
        onSubmit={handleSubmit}
        className="p-8 max-w-2xl mx-auto bg-white rounded-lg shadow-lg"
      >
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

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
          <label htmlFor="division" className="block mb-2 text-lg font-medium">
            Division
          </label>
          <select
            id="division"
            name="division"
            value={formData.division}
            onChange={(e) => {
              setFormData({
                ...formData,
                division: e.target.value,
                district: '',
              })
            }}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          >
            <option value="">Select Division</option>
            {divisions.map((division) => (
              <option key={division._id} value={division._id}>
                {division.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="district" className="block mb-2 text-lg font-medium">
            District
          </label>
          <select
            id="district"
            name="district"
            value={formData.district}
            onChange={(e) => {
              setFormData({
                ...formData,
                district: e.target.value,
              })
            }}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          >
            <option value="">Select District</option>
            {filteredDistricts.map((district) => (
              <option key={district._id} value={district._id}>
                {district.name}
              </option>
            ))}
          </select>
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

        <div className="mb-4">
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
            {['cctv', 'gym', 'security', 'pool'].map((amenity) => (
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
            value={formData.contactName}
            readOnly
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500"
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
            value={formData.email}
            readOnly
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="phone" className="block mb-2 text-lg font-medium">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            readOnly
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="image" className="block mb-2 text-lg font-medium">
            Upload an Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="w-full p-4 border rounded text-sm bg-gray-50 focus:bg-white focus:border-blue-500 hover:border-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </main>
  )
}
