'use client'
import React, { useEffect, useState } from 'react'
import { formatCurrency } from '@/app/utils/currency'

export default function AcceptedPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const fetchAccepted = async () => {
      const res = await fetch('/api/buyer/accepted')
      const data = await res.json()
      setOrders(data.results || [])
    }
    fetchAccepted()
  }, [])

  return (
    <div className="p-6">
      {orders.length === 0 ? (
        <p className="text-gray-600">No accepted or finalized orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((item, idx) => (
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
                  {item.type === 'buy' && (
                    <p className="text-blue-600">
                      <strong className="font-semibold">Accepted Price:</strong>{' '}
                      {formatCurrency(item.property.acceptedPrice, 'BDT')}
                    </p>
                  )}
                  {item.type === 'negotiation' && (
                    <>
                      <p className="text-blue-600">
                        <strong className="font-semibold">
                          Accepted Price:
                        </strong>{' '}
                        {formatCurrency(item.property.acceptedPrice, 'BDT')}
                      </p>
                      <p className="text-gray-600 text-xs">
                        (Original:{' '}
                        {formatCurrency(item.property.originalPrice, 'BDT')})
                      </p>
                    </>
                  )}
                  {item.offerPrice && item.type === 'negotiation' && (
                    <p className="text-sm text-gray-500 mt-1">
                      💬 Accepted Offer:{' '}
                      {formatCurrency(item.offerPrice, 'BDT')}
                    </p>
                  )}
                  <p className="text-green-600 mt-2 font-semibold">
                    <strong className="font-semibold">Status:</strong>{' '}
                    {item.status === 'finalized' ? 'Finalized' : 'Accepted'}
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
