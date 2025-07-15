'use client'

import { useState, useEffect } from 'react'
import SellerNavbarComp from '@/app/components/SellerNavbar'
import FooterSection from '@/app/components/Footer'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ConfirmationModal from '@/app/components/ConfirmationModal'

export default function OrderRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [buyRequests, setBuyRequests] = useState([])
  const [negotiations, setNegotiations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState({
    requestId: null,
    requestType: null,
    propertyTitle: '',
  })
  const [lastActionStatus, setLastActionStatus] = useState(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      fetchOrderRequests()
    }
  }, [status, router])

  const fetchOrderRequests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/seller/order-requests')
      if (!response.ok) {
        throw new Error('Failed to fetch order requests')
      }
      const data = await response.json()
      setBuyRequests(data.buyRequests || [])
      setNegotiations(data.negotiations || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching order requests:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestAction = async (id, type, action) => {
    try {
      const response = await fetch('/api/seller/update-request-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: id,
          requestType: type,
          status: action,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update request status')
      }

      setLastActionStatus({
        type: 'success',
        message: `Request ${action} successfully!`,
      })
      setTimeout(() => setLastActionStatus(null), 3000)
      fetchOrderRequests()
    } catch (err) {
      console.error('Error updating request status:', err)
      setLastActionStatus({ type: 'error', message: `Error: ${err.message}` })
      setTimeout(() => setLastActionStatus(null), 5000)
    }
  }

  const openHandoverModal = (requestId, requestType, propertyTitle) => {
    setModalContent({ requestId, requestType, propertyTitle })
    setIsModalOpen(true)
  }

  const handleConfirmHandover = async () => {
    setIsModalOpen(false)
    const { requestId, requestType, propertyTitle } = modalContent

    try {
      const response = await fetch('/api/seller/handover-property', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          requestType: requestType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to finalize sale')
      }

      setLastActionStatus({
        type: 'success',
        message: `"${propertyTitle}" successfully finalized and marked as sold!`,
      })
      setTimeout(() => setLastActionStatus(null), 5000)
      fetchOrderRequests()
    } catch (err) {
      console.error('Error during property handover:', err)
      setLastActionStatus({ type: 'error', message: `Error: ${err.message}` })
      setTimeout(() => setLastActionStatus(null), 5000)
    } finally {
      setModalContent({ requestId: null, requestType: null, propertyTitle: '' })
    }
  }

  const formatCurrency = (amount) => {
    return ` ${new Intl.NumberFormat('en-US', {
      style: 'decimal',
      maximumFractionDigits: 0,
    }).format(amount)} BDT`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const toggleExpandCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <SellerNavbarComp />
        <main className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </main>
        <FooterSection />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <SellerNavbarComp />

      <main className="flex-grow flex flex-col items-center py-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-center text-3xl font-bold text-gray-800 mb-8">
            Property Order Requests
          </h1>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {lastActionStatus && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                lastActionStatus.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {lastActionStatus.message}
            </div>
          )}

          <div className="grid gap-8">
            <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-md overflow-hidden h-auto">
              <div className="bg-blue-200 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Buy Requests
                </h2>
              </div>
              <div className="p-6 overflow-auto max-h-96">
                {buyRequests.length > 0 ? (
                  <div className="space-y-4">
                    {buyRequests.map((request) => (
                      <div
                        key={request._id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">
                              Property:{' '}
                              {request.property?.propertyTitle ||
                                'Untitled Property'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Price:{' '}
                              {formatCurrency(request.property?.price || 0)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Requested: {formatDate(request.createdAt)}
                            </p>
                            <div className="mt-2">
                              <p className="text-sm font-medium">
                                Buyer:{' '}
                                {request.buyerInfo?.fullname ||
                                  request.buyerEmail}
                              </p>
                              <button
                                onClick={() => toggleExpandCard(request._id)}
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                              >
                                {expandedCard === request._id
                                  ? 'Hide Details'
                                  : 'Show Details'}
                              </button>
                            </div>
                            {expandedCard === request._id &&
                              request.buyerInfo && (
                                <div className="mt-3 bg-blue-50 p-3 rounded-md">
                                  <h4 className="text-sm font-medium mb-2">
                                    Buyer Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <p className="text-xs">
                                      <span className="font-medium">Name:</span>{' '}
                                      {request.buyerInfo.fullname || 'N/A'}
                                    </p>
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Email:
                                      </span>{' '}
                                      {request.buyerInfo.email || 'N/A'}
                                    </p>
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Phone:
                                      </span>{' '}
                                      {request.buyerInfo.phone || 'N/A'}
                                    </p>
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Username:
                                      </span>{' '}
                                      {request.buyerInfo.username || 'N/A'}
                                    </p>
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Address:
                                      </span>{' '}
                                      {request.buyerInfo.address || 'N/A'}
                                    </p>
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Country:
                                      </span>{' '}
                                      {request.buyerInfo.country || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              )}
                          </div>
                          {request.property?.image && (
                            <div className="mt-2 md:mt-0">
                              <Image
                                src={request.property.image}
                                alt={
                                  request.property.propertyTitle || 'Property'
                                }
                                width={80}
                                height={60}
                                className="rounded-md object-cover h-15 w-20"
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          {request.status === 'pending' ? (
                            <div className="space-x-2">
                              <button
                                onClick={() =>
                                  handleRequestAction(
                                    request._id,
                                    'buy',
                                    'accepted',
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleRequestAction(
                                    request._id,
                                    'buy',
                                    'rejected',
                                  )
                                }
                                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : request.status === 'accepted' ? (
                            <button
                              onClick={() =>
                                openHandoverModal(
                                  request._id,
                                  'buy',
                                  request.property?.propertyTitle,
                                )
                              }
                              className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
                            >
                              Finalize Sale
                            </button>
                          ) : (
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full ${
                                request.status === 'finalized'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No buy requests found.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border-l-4 border-purple-500 rounded-lg shadow-md overflow-hidden h-auto">
              <div className="bg-purple-200 px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Negotiation Requests
                </h2>
              </div>
              <div className="p-6 overflow-auto max-h-96">
                {negotiations.length > 0 ? (
                  <div className="space-y-4">
                    {negotiations.map((negotiation) => (
                      <div
                        key={negotiation._id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex flex-col md:flex-row justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-medium text-lg">
                              Property:{' '}
                              {negotiation.property?.propertyTitle ||
                                'Untitled Property'}
                            </h3>
                            <div className="flex gap-2 items-center">
                              <p className="text-sm text-gray-600 line-through">
                                Original:{' '}
                                {formatCurrency(
                                  negotiation.property?.price || 0,
                                )}
                              </p>
                              <p className="text-sm text-green-600 font-medium">
                                Offer:{' '}
                                {formatCurrency(negotiation.offerPrice || 0)}
                              </p>
                            </div>
                            <p className="text-sm text-gray-600">
                              Requested: {formatDate(negotiation.createdAt)}
                            </p>
                            <div className="mt-2">
                              <p className="text-sm font-medium">
                                Buyer:{' '}
                                {negotiation.buyerInfo?.fullname ||
                                  negotiation.buyerEmail}
                              </p>
                              <button
                                onClick={() =>
                                  toggleExpandCard(negotiation._id)
                                }
                                className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                              >
                                {expandedCard === negotiation._id
                                  ? 'Hide Details'
                                  : 'Show Details'}
                              </button>
                            </div>
                            {expandedCard === negotiation._id &&
                              negotiation.buyerInfo && (
                                <div className="mt-3 bg-purple-50 p-3 rounded-md">
                                  <h4 className="text-sm font-medium mb-2">
                                    Buyer Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <p className="text-xs">
                                      <span className="font-medium">Name:</span>{' '}
                                      {negotiation.buyerInfo.fullname || 'N/A'}
                                    </p>
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Email:
                                      </span>{' '}
                                      {negotiation.buyerInfo.email || 'N/A'}
                                    </p>
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Phone:
                                      </span>{' '}
                                      {negotiation.buyerInfo.phone || 'N/A'}
                                    </p>
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Username:
                                      </span>{' '}
                                      {negotiation.buyerInfo.username || 'N/A'}
                                    </p>
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Address:
                                      </span>{' '}
                                      {negotiation.buyerInfo.address || 'N/A'}
                                    </p>
                                    <p className="text-xs">
                                      <span className="font-medium">
                                        Country:
                                      </span>{' '}
                                      {negotiation.buyerInfo.country || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            {negotiation.message && (
                              <p className="text-sm bg-gray-100 p-2 rounded mt-3 italic">
                                Message: "{negotiation.message}"
                              </p>
                            )}
                          </div>
                          {negotiation.property?.image && (
                            <div className="mt-2 md:mt-0">
                              <Image
                                src={negotiation.property.image}
                                alt={
                                  negotiation.property.propertyTitle ||
                                  'Property'
                                }
                                width={80}
                                height={60}
                                className="rounded-md object-cover h-15 w-20"
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          {negotiation.status === 'pending' ? (
                            <div className="space-x-2">
                              <button
                                onClick={() =>
                                  handleRequestAction(
                                    negotiation._id,
                                    'negotiation',
                                    'accepted',
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleRequestAction(
                                    negotiation._id,
                                    'negotiation',
                                    'rejected',
                                  )
                                }
                                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          ) : negotiation.status === 'accepted' ? (
                            <button
                              onClick={() =>
                                openHandoverModal(
                                  negotiation._id,
                                  'negotiation',
                                  negotiation.property?.propertyTitle,
                                )
                              }
                              className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded-md text-sm transition-colors"
                            >
                              Finalize Sale
                            </button>
                          ) : (
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full ${
                                negotiation.status === 'finalized'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {negotiation.status.charAt(0).toUpperCase() +
                                negotiation.status.slice(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    No negotiation requests found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmHandover}
        title="Finalize Property Sale"
        message={`Are you sure you want to finalize the sale of "${modalContent.propertyTitle}"? This action cannot be undone and will mark the property as sold.`}
        confirmText="Yes, Finalize Sale"
        cancelText="No, Cancel"
      />
    </div>
  )
}
