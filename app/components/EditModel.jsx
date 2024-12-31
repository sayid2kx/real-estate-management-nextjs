import { useEffect, useState } from 'react'

const EditModal = ({ isOpen, onClose, formData, onInputChange, onUpdate }) => {
  const [divisions, setDivisions] = useState([])
  const [allDistricts, setAllDistricts] = useState([])
  const [filteredDistricts, setFilteredDistricts] = useState([])
  const [error, setError] = useState('')

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
    if (formData.division) {
      const districtsForDivision = allDistricts.filter(
        (district) => district.division === formData.division,
      )
      setFilteredDistricts(districtsForDivision)
    } else {
      setFilteredDistricts([])
    }
  }, [formData.division, allDistricts])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-300 p-6 rounded-lg shadow-lg w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Property</h3>
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Property Title
              </label>
              <input
                type="text"
                name="propertyTitle"
                value={formData.propertyTitle || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter property title"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Property Type
              </label>
              <select
                name="propertyType"
                value={formData.propertyType || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="House">House</option>
                <option value="Apartment">Apartment</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter price"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bedrooms
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter number of bedrooms"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Bathrooms
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter number of bathrooms"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Total Area (sqft)
              </label>
              <input
                type="number"
                name="totalArea"
                value={formData.totalArea || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter total area"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter address"
              />
            </div>

            <div className="space-y-2 col-span-full">
              <label className="block text-sm font-medium text-gray-700">
                Division
              </label>
              <select
                id="division"
                name="division"
                value={formData.division || ''}
                onChange={(e) => {
                  onInputChange({
                    target: {
                      name: 'division',
                      value: e.target.value,
                    },
                  })
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Division</option>
                {divisions.map((division) => (
                  <option key={division._id} value={division._id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 col-span-full">
              <label className="block text-sm font-medium text-gray-700">
                District
              </label>
              <select
                id="district"
                name="district"
                value={formData.district || ''}
                onChange={(e) => {
                  onInputChange({
                    target: {
                      name: 'district',
                      value: e.target.value,
                    },
                  })
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select District</option>
                {filteredDistricts.map((district) => (
                  <option key={district._id} value={district._id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Zip/Postal Code
              </label>
              <input
                type="text"
                name="zipPostalCode"
                value={formData.zipPostalCode || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter zip/postal code"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Year Built
              </label>
              <input
                type="number"
                name="yearBuilt"
                value={formData.yearBuilt || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter year built"
              />
            </div>

            <div className="space-y-2 col-span-full">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter description"
                rows={4}
              />
            </div>

            <div className="col-span-full">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Amenities
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="amenities.cctv"
                    checked={formData.amenities?.cctv || false}
                    onChange={(e) =>
                      onInputChange({
                        target: {
                          name: 'amenities.cctv',
                          value: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">CCTV</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="amenities.gym"
                    checked={formData.amenities?.gym || false}
                    onChange={(e) =>
                      onInputChange({
                        target: {
                          name: 'amenities.gym',
                          value: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Gym</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="amenities.security"
                    checked={formData.amenities?.security || false}
                    onChange={(e) =>
                      onInputChange({
                        target: {
                          name: 'amenities.security',
                          value: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Security</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="amenities.pool"
                    checked={formData.amenities?.pool || false}
                    onChange={(e) =>
                      onInputChange({
                        target: {
                          name: 'amenities.pool',
                          value: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Pool</span>
                </label>
              </div>
            </div>

            <div className="col-span-full">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">
                Parking Availability
              </h4>
              <select
                name="parkingAvailability"
                value={formData.parkingAvailability || ''}
                onChange={onInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={onUpdate}
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditModal
