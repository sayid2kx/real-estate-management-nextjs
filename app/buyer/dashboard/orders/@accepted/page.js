'use client'
import React, { useEffect, useState } from 'react'

export default function AcceptedPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const fetchAccepted = async () => {
      const res = await fetch('/api/buyer/accepted')
      const data = await res.json()
      setOrders(data.orders || [])
    }
    fetchAccepted()
  }, [])

  // Format price without decimals and with BDT at the end
  const formatPrice = (amount) => {
    if (amount == null || isNaN(amount)) return '0 BDT'

    // Format as integer without decimals
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(amount)

    return `${formatted} BDT`
  }

  // Status badge configuration
  const statusConfig = {
    accepted: {
      text: 'Accepted',
      className: 'bg-blue-100 border-blue-200 text-blue-700',
    },
    finalized: {
      text: 'Finalized',
      className: 'bg-green-100 border-green-200 text-green-700',
    },
  }

  // Determine the correct price source based on purchase type
  const getPriceSource = (order) => {
    if (order.ownership) {
      return {
        price: order.purchasePrice,
        source: `PropertyOwnership (${order.ownership.purchaseType})`,
        isNegotiation: order.ownership.purchaseType === 'negotiation',
      }
    }

    // Fallback to model data if ownership not found
    return {
      price:
        order.type === 'buy'
          ? order.property.price
          : order.offerPrice || order.property.price,
      source: order.type === 'buy' ? 'Property' : 'Negotiation',
      isNegotiation: order.type === 'negotiation',
    }
  }

  return (
    <div className="p-6">
      {orders.length === 0 ? (
        <p className="text-gray-600">No accepted or finalized orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((item, idx) => {
            const priceInfo = getPriceSource(item)

            return (
              <li
                key={idx}
                className="bg-white border border-green-200 rounded-xl shadow-md p-4 md:p-6"
              >
                <h2 className="text-lg font-semibold text-green-800 mb-2">
                  {item.property.propertyTitle}
                </h2>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-700">
                      <strong className="font-semibold">Property Type:</strong>{' '}
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {item.property.propertyType}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      <strong className="font-semibold">Request Type:</strong>{' '}
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {item.type === 'buy' ? 'Buy Request' : 'Negotiation'}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      <strong className="font-semibold">Bedrooms:</strong>{' '}
                      {item.property.bedrooms}
                    </p>
                    <p className="text-gray-700">
                      <strong className="font-semibold">Bathrooms:</strong>{' '}
                      {item.property.bathrooms}
                    </p>
                    <p className="text-gray-700">
                      <strong className="font-semibold">Total Area:</strong>{' '}
                      {item.property.totalArea} sqft
                    </p>
                    <p className="text-gray-700">
                      <strong className="font-semibold">Year Built:</strong>{' '}
                      {item.property.yearBuilt}
                    </p>
                  </div>
                  <div>
                    {/* Display accepted price */}
                    <p className="text-blue-600">
                      <strong className="font-semibold">Accepted Price:</strong>{' '}
                      {formatPrice(priceInfo.price)}
                    </p>

                    {/* Show original price for negotiations */}
                    {priceInfo.isNegotiation && (
                      <p className="text-gray-600 text-xs">
                        (Original: {formatPrice(item.property.originalPrice)})
                      </p>
                    )}

                    {/* Show offer price if available */}
                    {item.type === 'negotiation' && item.offerPrice && (
                      <p className="text-sm text-gray-500 mt-1">
                        💬 Your Offer: {formatPrice(item.offerPrice)}
                      </p>
                    )}

                    {/* Purchase type badge */}
                    {item.ownership && (
                      <p className="text-xs text-gray-500 mt-1">
                        Purchase Type:{' '}
                        <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                          {item.ownership.purchaseType}
                        </span>
                      </p>
                    )}

                    {/* Status badge */}
                    <div className="mt-2">
                      <strong className="font-semibold">Status:</strong>{' '}
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusConfig[item.status]?.className}`}
                      >
                        {statusConfig[item.status]?.text || item.status}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
