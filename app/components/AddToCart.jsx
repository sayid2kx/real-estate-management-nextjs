'use client'
import { useEffect, useState } from 'react'
import NegotiationModal from './NegotiationModal'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import StatusModal from './StatusModal'
import Link from 'next/link'

const CartPage = () => {
  const [cartItems, setCartItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [showNegotiation, setShowNegotiation] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [statusTitle, setStatusTitle] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [propertyToDelete, setPropertyToDelete] = useState(null)

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/api/buyer/cart')

        if (!res.ok) {
          const errorText = await res.text()
          try {
            const errorJson = JSON.parse(errorText)
            throw new Error(errorJson.message || 'Failed to load cart')
          } catch {
            throw new Error(errorText || 'Failed to load cart')
          }
        }

        const text = await res.text()
        if (!text) {
          setCartItems([])
          return
        }

        const data = JSON.parse(text)
        setCartItems(data.cart?.items || [])
      } catch (err) {
        console.error('Error fetching cart:', err)
        setError(err.message || 'Network error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [])

  const handleDelete = async (propertyId) => {
    try {
      const res = await fetch('/api/buyer/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete item')
      }

      setCartItems((prev) =>
        prev.filter((item) => item.property._id !== propertyId),
      )
      setPropertyToDelete(null)
    } catch (err) {
      console.error('Error deleting item:', err)
      setStatusTitle('Error')
      setStatusMessage(err.message || 'Failed to delete item')
      setIsSuccess(false)
      setShowStatusModal(true)
    }
  }

  const handleBuyNow = async (propertyId) => {
    try {
      const res = await fetch('/api/buyer/buy-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        let errorMessage = 'Failed to send buy request'

        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }

        setStatusTitle('Error')
        setStatusMessage(errorMessage)
        setIsSuccess(false)
        setShowStatusModal(true)
        return
      }

      const text = await res.text()
      let successMessage = 'Buy request sent successfully.'

      if (text) {
        try {
          const data = JSON.parse(text)
          successMessage = data.message || successMessage
        } catch {}
      }

      setCartItems((prev) =>
        prev.filter((item) => item.property._id !== propertyId),
      )

      setStatusTitle('Success')
      setStatusMessage(successMessage)
      setIsSuccess(true)
      setShowStatusModal(true)
    } catch (error) {
      console.error('Buy request error:', error)
      setStatusTitle('Error')
      setStatusMessage(error.message || 'Failed to send buy request.')
      setIsSuccess(false)
      setShowStatusModal(true)
    }
  }

  const handleNegotiateSubmit = async (formData) => {
    try {
      const res = await fetch('/api/buyer/negotiate-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negotiations: formData }),
      })

      if (!res.ok) {
        const errorText = await res.text()
        let errorMessage = 'Failed to send negotiation request'

        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }

        setStatusTitle('Error')
        setStatusMessage(errorMessage)
        setIsSuccess(false)
        setShowStatusModal(true)
        return
      }

      const text = await res.text()
      let successMessage = 'Negotiation request sent successfully.'

      if (text) {
        try {
          const data = JSON.parse(text)
          successMessage = data.message || successMessage
        } catch {}
      }

      const negotiatedPropertyIds = formData.map((n) => n.propertyId)
      setCartItems((prev) =>
        prev.filter(
          (item) => !negotiatedPropertyIds.includes(item.property._id),
        ),
      )
      setStatusTitle('Success')
      setStatusMessage(successMessage)
      setIsSuccess(true)
      setShowStatusModal(true)
    } catch (error) {
      console.error('Negotiation error:', error)
      setStatusTitle('Error')
      setStatusMessage(error.message || 'Failed to send negotiation request.')
      setIsSuccess(false)
      setShowStatusModal(true)
    }
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    )

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    )

  return (
    <div className="p-6">
      {cartItems.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-2xl">Your cart is empty</p>
          <Link
            href="/buyer/dashboard"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Continue Browsing Properties
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {cartItems.map((item) => {
            const property = item.property
            const isAccepted = item.isAccepted // Get acceptance status

            return (
              <div
                key={item._id}
                className="relative bg-white p-6 rounded-xl shadow-md border border-gray-200"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3">
                    {property.image && (
                      <img
                        src={property.image}
                        alt={property.propertyTitle}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="w-full md:w-2/3 space-y-2">
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {property.propertyTitle}
                    </h2>
                    <p className="text-gray-600">
                      {property.propertyType} –{' '}
                      <span className="font-semibold">
                        {property.price?.toLocaleString() || 'N/A'} BDT
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
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

                    <div className="mt-6 flex flex-wrap gap-4 items-center">
                      {!isAccepted ? (
                        <>
                          <button
                            onClick={() => handleBuyNow(property._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded transition"
                          >
                            Buy Now
                          </button>

                          <button
                            onClick={() => {
                              setSelectedItems([property])
                              setShowNegotiation(true)
                            }}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded transition"
                          >
                            Negotiate
                          </button>
                        </>
                      ) : (
                        <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-medium">
                          Request Accepted
                        </span>
                      )}

                      <button
                        onClick={() => setPropertyToDelete(property)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showNegotiation && selectedItems.length > 0 && (
        <NegotiationModal
          selectedProperties={selectedItems}
          onClose={() => setShowNegotiation(false)}
          onSubmit={handleNegotiateSubmit}
        />
      )}

      {showStatusModal && (
        <StatusModal
          title={statusTitle}
          message={statusMessage}
          isSuccess={isSuccess}
          onClose={() => setShowStatusModal(false)}
        />
      )}

      {propertyToDelete && (
        <DeleteConfirmationModal
          property={propertyToDelete}
          onCancel={() => setPropertyToDelete(null)}
          onConfirm={() => handleDelete(propertyToDelete._id)}
        />
      )}
    </div>
  )
}

export default CartPage
