'use client'
import React, { useEffect, useState } from 'react'
import { formatCurrency } from '@/app/utils/currency'

export default function PendingPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const fetchPending = async () => {
      const res = await fetch('/api/buyer/pending')
      const data = await res.json()
      setOrders(data.results || [])
    }
    fetchPending()
  }, [])

  return (
    <div className="p-6">
      {orders.length === 0 ? (
        <p className="text-gray-600">No pending orders.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((item, idx) => (
            <li
              key={idx}
              className="bg-white border border-yellow-200 rounded-xl shadow-md p-4 md:p-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                {item.property.propertyTitle}
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-700">
                    <strong className="font-semibold">Type:</strong>{' '}
                    <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">
                      {item.property.propertyType}
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
                  {item.type === 'buy' && (
                    <p className="text-blue-600">
                      <strong className="font-semibold">Listed Price:</strong>{' '}
                      {formatCurrency(item.property.price, 'BDT')}
                    </p>
                  )}
                  {item.type === 'negotiation' && (
                    <>
                      <p className="text-blue-600">
                        <strong className="font-semibold">Your Offer:</strong>{' '}
                        {formatCurrency(item.offerPrice, 'BDT')}
                      </p>
                      <p className="text-gray-600 text-xs">
                        (Original: {formatCurrency(item.property.price, 'BDT')})
                      </p>
                    </>
                  )}
                  <p className="text-yellow-600 mt-2 font-semibold">
                    Status: Pending{' '}
                    {item.type === 'buy' ? 'Purchase' : 'Negotiation'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Awaiting seller response
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
