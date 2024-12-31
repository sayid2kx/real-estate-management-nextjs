'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const AllPropertiesShow = () => {
  const [properties, setProperties] = useState([])
  const [sortOrder, setSortOrder] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [district, setDistrict] = useState('')
  const [division, setDivision] = useState('')

  const [divisions, setDivisions] = useState([])
  const [allDistricts, setAllDistricts] = useState([])
  const [filteredDistricts, setFilteredDistricts] = useState([])

  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [noFilteredResults, setNoFilteredResults] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const divisionsResponse = await fetch('/api/seller/division')
        const divisionsData = await divisionsResponse.json()
        setDivisions(divisionsData)

        const districtsResponse = await fetch('/api/seller/district')
        const districtsData = await districtsResponse.json()
        setAllDistricts(districtsData)

        await fetchProperties()
      } catch (error) {
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (division) {
      const filtered = allDistricts.filter(
        (district) => district.division === division,
      )
      setFilteredDistricts(filtered)
    } else {
      setFilteredDistricts(allDistricts)
    }
  }, [division, allDistricts])

  const fetchProperties = async (useFilters = true) => {
    try {
      setIsLoading(true)
      let url = '/api/seller/allproperties'

      if (useFilters) {
        const params = new URLSearchParams()
        if (sortOrder) params.append('sortOrder', sortOrder)
        if (propertyType) params.append('propertyType', propertyType)
        if (district) params.append('district', district)
        if (division) params.append('division', division)
        if (params.toString()) url += `?${params.toString()}`
      }

      const res = await fetch(url)
      const data = await res.json()

      if (res.ok) {
        if (data.message === 'No properties found') {
          setProperties([])
          setError('No properties found')
          setNoFilteredResults(false)
          return
        }

        if (data.message === 'No properties found in this filter criteria') {
          setProperties([])
          setNoFilteredResults(true)

          setTimeout(() => {
            setNoFilteredResults(false)
            fetchProperties(false)
          }, 3000)
          return
        }

        setProperties(data.properties)
        setError('')
        setNoFilteredResults(false)
      } else {
        console.error('Error fetching properties', res.status)
        setProperties([])
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
      setProperties([])
    } finally {
      setIsLoading(false)
    }
  }

  const resetFilters = () => {
    setSortOrder('')
    setPropertyType('')
    setDistrict('')
    setDivision('')
    fetchProperties()
  }

  const handleFilter = () => {
    fetchProperties()
  }

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner"></div>
        </div>
      ) : noFilteredResults ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-4xl text-gray-700">
            No properties found in this filter criteria
          </p>
        </div>
      ) : properties.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-4xl text-gray-700">{error}</p>
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              <option value="">Price</option>
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>

            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded"
            >
              <option value="">Property Type</option>
              <option value="House">House</option>
              <option value="Apartment">Apartment</option>
            </select>

            <div>
              <select
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value)
                  setDistrict('')
                }}
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

            <div>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
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

            <button
              onClick={handleFilter}
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Filter
            </button>
          </div>

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
                    {property.image ? (
                      <img
                        src={property.image}
                        alt={property.propertyTitle}
                        className="object-cover w-full h-full"
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
                    {property.propertyType} -{' '}
                    <span className="font-semibold">
                      {property.price.toLocaleString()} BDT
                    </span>
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    {property.address}, {property.district?.name || 'N/A'},{' '}
                    {property.division?.name || 'N/A'}
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
        </>
      )}
    </div>
  )
}

export default AllPropertiesShow
