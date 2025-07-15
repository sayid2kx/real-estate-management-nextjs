'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import EditModal from './EditModel'
import DeleteModal from './DeleteModel'
import ReviewDisplay from './ReviewDisplay'

const SellerPropertiesShow = () => {
  const { data: session } = useSession()
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [propertyToEdit, setPropertyToEdit] = useState(null)
  const [formData, setFormData] = useState({})
  const [message, setMessage] = useState('')
  const [sellerPropertyReviews, setSellerPropertyReviews] = useState({})
  const [sellerExpandedReviews, setSellerExpandedReviews] = useState({})
  const [reviewsLoading, setReviewsLoading] = useState(false)

  const fetchReviewsForSellerProperties = async (propertyIds) => {
    setReviewsLoading(true)
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
            `Error fetching reviews for property ${propertyId}:`,
            response.status,
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
    setSellerPropertyReviews(reviewsData)
    setReviewsLoading(false)
  }

  const fetchProperties = async (email) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/seller/property/${email}`)
      if (res.ok) {
        const data = await res.json()
        setProperties(data)
        if (data && data.length > 0) {
          const finalizedPropertyIds = data
            .filter((p) => p.isFinalized)
            .map((p) => p._id)
          if (finalizedPropertyIds.length > 0) {
            fetchReviewsForSellerProperties(finalizedPropertyIds)
          } else {
            setSellerPropertyReviews({})
          }
        }
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

  useEffect(() => {
    if (session) {
      fetchProperties(session.user.email)
    }
  }, [session])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 1500)
      return () => clearTimeout(timer)
    }
  }, [message])

  const handleDelete = async () => {
    if (!propertyToDelete) return

    setIsDeleting(true)

    try {
      const res = await fetch(
        `/api/seller/delete-property/${propertyToDelete._id}`,
        {
          method: 'DELETE',
        },
      )

      if (res.ok) {
        setProperties(properties.filter((p) => p._id !== propertyToDelete._id))
        setSellerPropertyReviews((prevState) => {
          const newState = { ...prevState }
          delete newState[propertyToDelete._id]
          return newState
        })
        setDialogOpen(false)
        setPropertyToDelete(null)
        setMessage('Property deleted successfully!')
      } else {
        setMessage('Failed to delete property. Please try again.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const openDialog = (property) => {
    setPropertyToDelete(property)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setPropertyToDelete(null)
  }

  const openEditModal = (property) => {
    setPropertyToEdit(property)
    setFormData(property)
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setPropertyToEdit(null)
    setFormData({})
    setMessage('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleUpdate = async () => {
    if (!propertyToEdit) return

    try {
      const res = await fetch(
        `/api/seller/update-property/${propertyToEdit._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        },
      )

      if (res.ok) {
        const updatedProperty = await res.json()
        setProperties(
          properties.map((p) =>
            p._id === updatedProperty._id ? updatedProperty : p,
          ),
        )
        closeEditModal()
        setMessage('Property updated successfully!')
      } else {
        setMessage('Failed to update property. Please try again.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    }
  }

  const toggleSellerReviewsVisibility = (propertyId) => {
    setSellerExpandedReviews((prevState) => ({
      ...prevState,
      [propertyId]: !prevState[propertyId],
    }))
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading session...
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mr-2"></div>
        <span className="text-sm text-gray-700">Loading Properties...</span>
      </div>
    )
  }

  if (properties.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 to-sky-200">
        <Link
          href="/seller/dashboard/add-property"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-transform transform hover:scale-110"
        >
          Add Property
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4">
      {message && (
        <div
          className={`p-4 mb-4 ${
            message.includes('success') ? 'bg-green-100' : 'bg-red-100'
          } text-${
            message.includes('success') ? 'green-700' : 'red-700'
          } rounded-lg`}
        >
          {message}
        </div>
      )}
      <ul className="space-y-8">
        {properties.map((property) => (
          <li
            key={property._id}
            className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col relative"
          >
            <div className="w-full md:w-auto flex flex-col md:flex-row">
              <Link
                href={`/seller/dashboard/my-properties/${property._id}`}
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
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    {property.propertyTitle}
                  </h2>
                  {property.isSold && (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        property.isFinalized
                          ? property.saleType === 'direct'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {property.isFinalized
                        ? property.saleType === 'direct'
                          ? 'Sold (Finalized)'
                          : 'Sale Agreed (Finalized)'
                        : 'Offer Accepted'}
                    </span>
                  )}
                </div>
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

                {!property.isFinalized && (
                  <div className="flex space-x-6 mt-4">
                    <div
                      className="flex items-center cursor-pointer bg-blue-100 border border-blue-400 rounded-full p-2 hover:bg-blue-200 transition-colors"
                      onClick={() => openEditModal(property)}
                    >
                      <Image
                        src="/icons/edit1.svg"
                        alt="Edit"
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      <span className="text-gray-800 font-semibold">Edit</span>
                    </div>
                    <div
                      className="flex items-center cursor-pointer bg-red-100 border border-red-400 rounded-full p-2 hover:bg-red-200 transition-colors"
                      onClick={() => openDialog(property)}
                    >
                      <Image
                        src="/icons/delete1.svg"
                        alt="Delete"
                        width={24}
                        height={24}
                        className="mr-2"
                      />
                      <span className="text-gray-800 font-semibold">
                        Delete
                      </span>
                    </div>
                  </div>
                )}

                {property.isSold && property.buyerName && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-gray-700">
                      <span className="font-medium">
                        {property.isFinalized ? 'Sold to' : 'Offer accepted by'}
                        :
                      </span>{' '}
                      {property.buyerName}
                    </p>
                    {property.saleType === 'negotiated' &&
                      property.negotiatedPrice !== undefined &&
                      property.originalPrice !== undefined && (
                        <p className="text-gray-700">
                          <span className="font-medium">Sale price:</span>{' '}
                          <span className="text-green-600 font-semibold">
                            {property.negotiatedPrice.toLocaleString()} BDT
                          </span>
                          <span className="text-gray-500 text-sm ml-2">
                            (Original: {property.originalPrice.toLocaleString()}{' '}
                            BDT)
                          </span>
                        </p>
                      )}
                    {property.isSold &&
                      property.saleType === 'direct' &&
                      property.originalPrice !== undefined && (
                        <p className="text-gray-700">
                          <span className="font-medium">Sale price:</span>{' '}
                          <span className="text-green-600 font-semibold">
                            {property.originalPrice.toLocaleString()} BDT
                          </span>
                        </p>
                      )}
                    {property.soldDate && (
                      <p className="text-sm text-gray-600">
                        {property.isFinalized
                          ? 'Sale completed on'
                          : 'Offer accepted on'}{' '}
                        {new Date(property.soldDate).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {property.saleType === 'direct'
                        ? 'Direct purchase'
                        : 'Negotiated sale'}
                      {property.isFinalized && ' (Finalized)'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {property.isFinalized && (
              <div className="w-full px-6 py-4 bg-gray-50 border-t border-gray-200">
                {reviewsLoading ? (
                  <div className="flex justify-start items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                    <span className="text-sm text-gray-700">
                      Loading Reviews...
                    </span>
                  </div>
                ) : sellerPropertyReviews[property._id] &&
                  sellerPropertyReviews[property._id].length > 0 ? (
                  <>
                    <div className="flex justify-start items-center mb-3">
                      <button
                        onClick={() =>
                          toggleSellerReviewsVisibility(property._id)
                        }
                        className="text-blue-600 hover:underline text-sm font-medium focus:outline-none mr-4"
                      >
                        {sellerExpandedReviews[property._id]
                          ? 'Hide Reviews'
                          : 'Show Reviews'}
                      </button>
                      <span className="text-sm text-gray-700">
                        ({sellerPropertyReviews[property._id].length} Reviews)
                      </span>
                    </div>

                    {sellerExpandedReviews[property._id] && (
                      <div className="space-y-4">
                        {sellerPropertyReviews[property._id].map((review) => (
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
            )}
          </li>
        ))}
      </ul>

      <DeleteModal
        isOpen={dialogOpen}
        onClose={closeDialog}
        propertyToDelete={propertyToDelete}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        formData={formData}
        onInputChange={handleInputChange}
        onUpdate={handleUpdate}
      />
    </div>
  )
}

export default SellerPropertiesShow
