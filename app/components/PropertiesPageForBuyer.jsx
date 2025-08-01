'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ReviewModal from './ReviewModal'
import EditReviewModal from './EditReviewModal'
import ReviewDisplay from './ReviewDisplay'

const PropertiesPageforBuyer = () => {
  const [properties, setProperties] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showEditReviewModal, setShowEditReviewModal] = useState(false)
  const [selectedPropertyForReview, setSelectedPropertyForReview] =
    useState(null)
  const [existingReview, setExistingReview] = useState(null)
  const [propertyReviews, setPropertyReviews] = useState({})
  const [expandedReviews, setExpandedReviews] = useState({})
  const [reviewLoadingId, setReviewLoadingId] = useState(null)
  const [buyerEmail, setBuyerEmail] = useState(null)
  const [canReviewProperties, setCanReviewProperties] = useState({})

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const session = await response.json()
        setBuyerEmail(session?.user?.email || null)
      } catch (error) {
        console.error('Failed to fetch session:', error)
        setBuyerEmail(null)
      }
    }
    fetchSession()
  }, [])

  const fetchReviewsForProperties = async (propertyIds) => {
    const reviewsData = {}
    for (const propertyId of propertyIds) {
      try {
        const response = await fetch(`/api/buyer/reviews/${propertyId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.reviews) {
            reviewsData[propertyId] = data.reviews
          } else {
            reviewsData[propertyId] = []
          }
        } else {
          console.error(
            `Error fetching reviews for property ${propertyId}: ${response.status}`,
          )
          reviewsData[propertyId] = []
        }
      } catch (error) {
        console.error(
          `Failed to fetch reviews for property ${propertyId}:`,
          error,
        )
        reviewsData[propertyId] = []
      }
    }
    setPropertyReviews((prevReviews) => ({ ...prevReviews, ...reviewsData }))
  }

  const checkOwnership = async (propertyIds) => {
    const ownershipData = {}
    for (const propertyId of propertyIds) {
      try {
        const response = await fetch(`/api/buyer/check-ownership/${propertyId}`)
        if (response.ok) {
          const data = await response.json()
          ownershipData[propertyId] = data.isOwner
        } else {
          ownershipData[propertyId] = false
        }
      } catch (error) {
        console.error(
          `Failed to check ownership for property ${propertyId}:`,
          error,
        )
        ownershipData[propertyId] = false
      }
    }
    setCanReviewProperties((prev) => ({ ...prev, ...ownershipData }))
  }

  const fetchProperties = async () => {
    if (!buyerEmail) return

    try {
      setIsLoading(true)
      const res = await fetch('/api/buyer/my-properties')
      const data = await res.json()

      if (res.ok) {
        if (data.message === 'No properties found') {
          setProperties([])
          setError('No properties purchased.')
          return []
        }

        setProperties(data.properties)
        setError('')
        if (data.properties && data.properties.length > 0) {
          const propertyIds = data.properties.map((p) => p._id)
          fetchReviewsForProperties(propertyIds)
          checkOwnership(propertyIds)
        }
        return data.properties
      } else {
        console.error('Error fetching properties:', res.status, data.message)
        setProperties([])
        setError(data.message || 'Failed to fetch properties.')
        return []
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
      setProperties([])
      setError('Failed to fetch properties.')
      return []
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (buyerEmail) {
      fetchProperties()
    }
  }, [buyerEmail])

  const handleReviewAction = async (property) => {
    try {
      setReviewLoadingId(property._id)
      const sessionResponse = await fetch('/api/auth/session')
      const session = await sessionResponse.json()
      const buyerEmail = session?.user?.email

      if (!buyerEmail) {
        console.error('No user session found')
        return
      }

      const response = await fetch(`/api/buyer/reviews/${property._id}`)
      const data = await response.json()

      if (data.success && data.reviews) {
        const userReview = data.reviews.find(
          (review) => review.buyerEmail === buyerEmail,
        )
        if (userReview) {
          setExistingReview(userReview)
          setSelectedPropertyForReview(property)
          setShowEditReviewModal(true)
        } else {
          setExistingReview(null)
          setSelectedPropertyForReview(property)
          setShowReviewModal(true)
        }
      }
    } catch (error) {
      console.error('Failed to check existing review:', error)
    } finally {
      setReviewLoadingId(null)
    }
  }

  const handleReviewSubmit = async (propertyId, reviewMessage, rating) => {
    try {
      const sessionResponse = await fetch('/api/auth/session')
      const session = await sessionResponse.json()
      const buyerEmail = session?.user?.email

      if (!buyerEmail) {
        console.error('No user session found')
        throw new Error('User not authenticated')
      }

      const response = await fetch(`/api/buyer/reviews/${propertyId}`)
      const data = await response.json()
      const userReview =
        data.success && data.reviews
          ? data.reviews.find((review) => review.buyerEmail === buyerEmail)
          : null

      const url = userReview ? '/api/buyer/reviews/edit' : '/api/buyer/reviews'
      const method = userReview ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          buyerMessage: reviewMessage,
          rating: userReview ? undefined : rating, // Rating is not updated on edit
        }),
      })

      const result = await res.json()

      if (res.ok) {
        setShowReviewModal(false)
        setShowEditReviewModal(false)
        setSelectedPropertyForReview(null)
        setExistingReview(null)
        fetchReviewsForProperties([propertyId])
      } else {
        console.error('Error submitting review:', result.message)
        throw new Error(result.message || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Failed to submit review:', error)
      throw error
    }
  }

  const closeReviewModal = () => {
    setShowReviewModal(false)
    setShowEditReviewModal(false)
    setSelectedPropertyForReview(null)
    setExistingReview(null)
  }

  const toggleReviewsVisibility = (propertyId) => {
    setExpandedReviews((prevState) => ({
      ...prevState,
      [propertyId]: !prevState[propertyId],
    }))
  }

  return (
    <div className="p-4 container mx-auto">
      {showReviewModal && selectedPropertyForReview && (
        <ReviewModal
          property={selectedPropertyForReview}
          onClose={closeReviewModal}
          onSubmit={handleReviewSubmit}
        />
      )}

      {showEditReviewModal && selectedPropertyForReview && existingReview && (
        <EditReviewModal
          property={selectedPropertyForReview}
          existingReview={existingReview}
          onClose={closeReviewModal}
          onSubmit={handleReviewSubmit}
        />
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-4xl text-gray-700">
            {error || 'No properties purchased.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-8">
          {properties.map((property) => {
            const hasReview =
              buyerEmail &&
              propertyReviews[property._id]?.some(
                (review) => review.buyerEmail === buyerEmail,
              )
            const canReview = canReviewProperties[property._id]
            return (
              <li
                key={property._id}
                className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col relative"
              >
                <div className="w-full md:w-auto flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3">
                    <Link href={`/buyer/dashboard/${property._id}`} passHref>
                      <div className="relative h-48 md:h-full cursor-pointer">
                        {property.image ? (
                          <img
                            src={property.image}
                            alt={property.propertyTitle}
                            className="object-cover w-full h-full rounded-t-lg md:rounded-l-lg md:rounded-tr-none"
                          />
                        ) : (
                          <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500 text-sm rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
                            No Image Available
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>

                  <div className="w-full md:w-2/3 p-6 relative flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                        {property.propertyTitle}
                      </h2>
                      <p className="text-lg text-gray-600 mb-4">
                        {property.propertyType} -{' '}
                        <span className="font-semibold">
                          {(property.price || 0).toLocaleString()} BDT
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

                    {canReview && buyerEmail && (
                      <div className="mt-4 flex gap-4 self-end">
                        <button
                          onClick={() => handleReviewAction(property)}
                          disabled={reviewLoadingId === property._id}
                          className={`px-4 py-2 rounded-md text-white ${
                            reviewLoadingId === property._id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-purple-500 hover:bg-purple-600'
                          } transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
                        >
                          {reviewLoadingId === property._id
                            ? 'Loading...'
                            : hasReview
                              ? 'Edit Review'
                              : 'Write Review'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full px-6 py-4 bg-gray-50 border-t border-gray-200">
                  {propertyReviews[property._id] &&
                  propertyReviews[property._id].length > 0 ? (
                    <>
                      <div className="flex justify-start items-center mb-3">
                        <button
                          onClick={() => toggleReviewsVisibility(property._id)}
                          className="text-blue-600 hover:underline text-sm font-medium focus:outline-none mr-4"
                        >
                          {expandedReviews[property._id]
                            ? 'Hide Reviews'
                            : 'Show Reviews'}
                        </button>
                        <span className="text-sm text-gray-700">
                          ({propertyReviews[property._id].length} Reviews)
                        </span>
                      </div>

                      {expandedReviews[property._id] && (
                        <div className="space-y-4">
                          {propertyReviews[property._id].map((review) => (
                            <ReviewDisplay key={review._id} review={review} />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-start items-center">
                      <span className="text-sm text-gray-500">
                        No Reviews Yet
                      </span>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default PropertiesPageforBuyer
