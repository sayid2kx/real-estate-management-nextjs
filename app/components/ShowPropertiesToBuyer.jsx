'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ReviewDisplay from './ReviewDisplay'

const AllPropertiesShowToBuyer = () => {
  const [properties, setProperties] = useState([])
  const [sortOrder, setSortOrder] = useState('')
  const [propertyType, setPropertyType] = useState('')
  const [district, setDistrict] = useState('')
  const [division, setDivision] = useState('')
  const [status, setStatus] = useState('')
  const [divisions, setDivisions] = useState([])
  const [allDistricts, setAllDistricts] = useState([])
  const [filteredDistricts, setFilteredDistricts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [isDbEmpty, setIsDbEmpty] = useState(false)
  const [noFilteredResults, setNoFilteredResults] = useState(false)
  const [cartItems, setCartItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [showAlreadyInCartModal, setShowAlreadyInCartModal] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [currentPropertyId, setCurrentPropertyId] = useState(null)
  const [propertyReviews, setPropertyReviews] = useState({})
  const [expandedReviews, setExpandedReviews] = useState({})
  const [showFilters, setShowFilters] = useState(false) // Initialize as false
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProperties, setTotalProperties] = useState(0)
  const propertiesPerPage = 5

  const router = useRouter()

  const fetchProperties = useCallback(
    async (useFilters = true, page = 1) => {
      setIsLoading(true)
      setApiError('')
      setIsDbEmpty(false)
      setNoFilteredResults(false)

      const params = new URLSearchParams({
        page: String(page),
        limit: String(propertiesPerPage),
      })

      if (useFilters) {
        if (sortOrder) params.append('sortOrder', sortOrder)
        if (propertyType) params.append('propertyType', propertyType)
        if (district) params.append('district', district)
        if (division) params.append('division', division)
        if (status) params.append('status', status)
      }

      try {
        const res = await fetch(`/api/buyer/allproperties?${params.toString()}`)
        const data = await res.json()

        if (!res.ok)
          throw new Error(data.message || 'An unknown server error occurred')

        if (data.message === 'No properties found') {
          setIsDbEmpty(true)
          setShowFilters(false) // Hide filters when database is empty
          setProperties([])
        } else if (data.message === 'No properties match the filter criteria') {
          setNoFilteredResults(true)
          setShowFilters(true) // Show filters when properties exist but filtered out
          setProperties([])
        } else {
          setProperties(data.properties || [])
          setTotalPages(data.totalPages || 1)
          setTotalProperties(data.totalProperties || 0)
          setShowFilters(true) // Show filters when properties exist
          if (data.properties && data.properties.length > 0) {
            fetchReviewsForProperties(data.properties.map((p) => p._id))
          }
        }
      } catch (err) {
        setApiError(err.message)
        setShowFilters(false) // Hide filters on error
      } finally {
        setIsLoading(false)
      }
    },
    [sortOrder, propertyType, district, division, status],
  )

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [divisionsRes, districtsRes] = await Promise.all([
          fetch('/api/buyer/division'),
          fetch('/api/buyer/district'),
        ])
        const divisionsData = await divisionsRes.json()
        const districtsData = await districtsRes.json()
        setDivisions(divisionsData)
        setAllDistricts(districtsData)
        setFilteredDistricts(districtsData)
      } catch (err) {
        setApiError('Failed to load filter options.')
      }
    }
    fetchDropdownData()
  }, [])

  useEffect(() => {
    fetchProperties(true, currentPage)
  }, [currentPage])

  useEffect(() => {
    setFilteredDistricts(
      division
        ? allDistricts.filter((d) => d.division === division)
        : allDistricts,
    )
  }, [division, allDistricts])

  const handleFilter = () => {
    if (currentPage === 1) {
      fetchProperties(true, 1)
    } else {
      setCurrentPage(1)
    }
  }

  const resetAndRefetch = () => {
    setSortOrder('')
    setPropertyType('')
    setDivision('')
    setDistrict('')
    setStatus('')
    setCurrentPage(1)
    setShowFilters(true)
    setNoFilteredResults(false)
    setIsDbEmpty(false)

    fetchProperties(false, 1)
  }

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  const handleMessageSeller = async (propertyId, sellerEmail) => {
    try {
      const res = await fetch('/api/chat/check-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, sellerEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/buyer/dashboard/chat/${data.chatId}`)
      } else {
        alert(data.message || 'Failed to start chat.')
      }
    } catch (error) {
      alert('An error occurred while trying to message the seller.')
    }
  }

  const fetchReviewsForProperties = async (propertyIds) => {
    const reviewsData = {}
    for (const propertyId of propertyIds) {
      try {
        const response = await fetch(`/api/buyer/reviews/${propertyId}`)
        if (response.ok) {
          const data = await response.json()
          reviewsData[propertyId] = data.success ? data.reviews : []
        } else {
          reviewsData[propertyId] = []
        }
      } catch (error) {
        reviewsData[propertyId] = []
      }
    }
    setPropertyReviews((prev) => ({ ...prev, ...reviewsData }))
  }

  const handleAddToCart = async (propertyId) => {
    setCurrentPropertyId(propertyId)
    setIsAddingToCart(true)
    try {
      const res = await fetch('/api/buyer/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })
      const data = await res.json()
      if (res.ok) {
        setShowModal(true)
      } else if (res.status === 409) {
        setShowAlreadyInCartModal(true)
      } else {
        alert(data.message || 'Failed to add property to cart.')
      }
    } catch (error) {
      alert('An error occurred while adding to cart.')
    } finally {
      setIsAddingToCart(false)
      setCurrentPropertyId(null)
    }
  }

  const toggleReviewsVisibility = (propertyId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [propertyId]: !prev[propertyId],
    }))
  }

  const EmptyStateMessage = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center w-full">
      {isDbEmpty ? (
        // Simple text for empty database
        <p className="text-3xl md:text-4xl text-gray-700 font-medium">
          No properties found
        </p>
      ) : (
        // Container for filtered results
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-md w-full">
          <p className="text-2xl text-gray-700 mb-6">
            No properties match the filter criteria
          </p>
          <button
            onClick={resetAndRefetch}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )

  const AddToCartSuccessModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4">Add to Cart Successful</h3>
        <p className="mb-6">The property has been added to your cart.</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )

  const AlreadyInCartModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
        <h3 className="text-lg font-semibold mb-4 text-red-600">
          Already In Cart
        </h3>
        <p className="mb-6">This property is already in your cart.</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (apiError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <p className="text-4xl text-red-600 mb-4">{apiError}</p>
        <button
          onClick={resetAndRefetch}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 container mx-auto">
      {showModal && (
        <AddToCartSuccessModal onClose={() => setShowModal(false)} />
      )}
      {showAlreadyInCartModal && (
        <AlreadyInCartModal onClose={() => setShowAlreadyInCartModal(false)} />
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {showFilters && (
          <div className="lg:w-1/3 w-full">
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Filter Properties</h3>
              <div className="flex flex-col gap-4">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Price</option>
                  <option value="asc">Low to High</option>
                  <option value="desc">High to Low</option>
                </select>

                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Property Type</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                </select>

                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value)
                    setDistrict('')
                  }}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Select Division</option>
                  {divisions.map((div) => (
                    <option key={div._id} value={div._id}>
                      {div.name}
                    </option>
                  ))}
                </select>

                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Select District</option>
                  {filteredDistricts.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Status</option>
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={handleFilter}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Filter
                  </button>
                  <button
                    onClick={resetAndRefetch}
                    className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={showFilters ? 'lg:w-2/3 w-full' : 'w-full'}>
          {(noFilteredResults || isDbEmpty) && <EmptyStateMessage />}

          {!noFilteredResults && !isDbEmpty && properties.length > 0 && (
            <>
              <ul className="space-y-8">
                {properties.map((property) => {
                  const statusDisplay =
                    property.status === 'finalized'
                      ? { text: 'SOLD', bg: 'bg-red-600' }
                      : property.status === 'accepted'
                        ? { text: 'OFFER ACCEPTED', bg: 'bg-yellow-500' }
                        : null

                  return (
                    <li
                      key={property._id}
                      className="bg-white border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col relative"
                    >
                      {statusDisplay && (
                        <div
                          className={`absolute top-0 right-0 py-1 px-3 rounded-bl z-10 font-bold text-white ${statusDisplay.bg}`}
                        >
                          {statusDisplay.text}
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/3">
                          <Link
                            href={`/buyer/dashboard/${property._id}`}
                            passHref
                          >
                            <div className="relative h-48 md:h-full cursor-pointer">
                              <img
                                src={property.image || '/placeholder.png'}
                                alt={property.propertyTitle}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          </Link>
                        </div>

                        <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
                          <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                              {property.propertyTitle}
                            </h2>
                            <p className="text-lg text-gray-600 mb-4">
                              {property.propertyType} -{' '}
                              <span className="font-semibold">
                                {property.status === 'available' ? (
                                  `${(property.price || 0).toLocaleString()} BDT`
                                ) : (
                                  <>
                                    {property.purchaseType ===
                                      'negotiation' && (
                                      <span className="line-through text-sm mr-2 text-gray-500">
                                        {(property.price || 0).toLocaleString()}{' '}
                                        BDT
                                      </span>
                                    )}
                                    <span className="text-green-600">
                                      {(
                                        property.purchasePrice || 0
                                      ).toLocaleString()}{' '}
                                      BDT
                                    </span>
                                  </>
                                )}
                              </span>
                            </p>

                            <p className="text-sm text-gray-500 mb-4">
                              {property.address},{' '}
                              {property.district?.name || 'N/A'},{' '}
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
                                <strong>Area:</strong> {property.totalArea} sqft
                              </p>
                              <p>
                                <strong>Built:</strong> {property.yearBuilt}
                              </p>
                            </div>
                          </div>

                          {property.status === 'available' ? (
                            <div className="mt-4 flex gap-4 self-end">
                              <button
                                onClick={() =>
                                  handleMessageSeller(
                                    property._id,
                                    property.email,
                                  )
                                }
                                className="px-4 py-2 rounded-md text-white bg-blue-500 hover:bg-blue-600"
                              >
                                Message
                              </button>
                              <button
                                onClick={() => handleAddToCart(property._id)}
                                disabled={
                                  isAddingToCart &&
                                  currentPropertyId === property._id
                                }
                                className={`px-4 py-2 rounded-md text-white transition-colors ${
                                  isAddingToCart &&
                                  currentPropertyId === property._id
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600'
                                }`}
                              >
                                {isAddingToCart &&
                                currentPropertyId === property._id
                                  ? 'Adding...'
                                  : 'Add to Cart'}
                              </button>
                            </div>
                          ) : (
                            <div className="mt-4 text-sm text-gray-700 border rounded-lg p-4 bg-gray-50">
                              <p>
                                <strong>Buyer:</strong>{' '}
                                {property.buyerInfo?.fullname || 'N/A'}
                              </p>
                              <p>
                                <strong>Final Price:</strong>{' '}
                                {(property.purchasePrice || 0).toLocaleString()}{' '}
                                BDT
                              </p>
                              <p>
                                <strong>Date:</strong>{' '}
                                {property.purchaseDate
                                  ? new Date(
                                      property.purchaseDate,
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {property.status === 'finalized' && (
                        <div className="w-full px-6 py-4 bg-gray-50 border-t">
                          {propertyReviews[property._id]?.length > 0 ? (
                            <>
                              <button
                                onClick={() =>
                                  toggleReviewsVisibility(property._id)
                                }
                                className="text-blue-600 hover:underline text-sm font-medium"
                              >
                                {expandedReviews[property._id]
                                  ? 'Hide'
                                  : 'Show'}{' '}
                                Reviews ({propertyReviews[property._id].length})
                              </button>
                              {expandedReviews[property._id] && (
                                <div className="space-y-4 mt-3">
                                  {propertyReviews[property._id].map(
                                    (review) => (
                                      <ReviewDisplay
                                        key={review._id}
                                        review={review}
                                      />
                                    ),
                                  )}
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">
                              No Reviews Yet
                            </span>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              {totalProperties > propertiesPerPage && (
                <div className="mt-8 flex justify-center items-center gap-4">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed bg-blue-500 text-white"
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed bg-blue-500 text-white"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllPropertiesShowToBuyer
