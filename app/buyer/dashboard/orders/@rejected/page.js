'use client'
import React, { useEffect, useState } from 'react'
import { formatCurrency } from '@/app/utils/currency'

export default function RejectedPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    const fetchRejected = async () => {
      const res = await fetch('/api/buyer/rejected')
      const data = await res.json()
      setOrders(data.results || [])
    }
    fetchRejected()
  }, [])

  return (
    <div className="p-6">
      {orders.length === 0 ? (
        <p className="text-gray-600">No rejected orders.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((item, idx) => (
            <li
              key={idx}
              className="bg-white border border-red-200 rounded-xl shadow-md p-6"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.property.propertyTitle}
                  </h2>
                  <p className="text-gray-700">
                    <strong className="font-semibold">Type:</strong>{' '}
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
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
                    <>
                      <p className="font-semibold mb-2">
                        Price:{' '}
                        {formatCurrency(item.property.originalPrice, 'BDT')}
                      </p>
                      <p className="text-red-500 mt-2">
                        <strong>Status:</strong> Buy request was rejected by the
                        seller.
                      </p>
                    </>
                  )}

                  {item.type === 'negotiation' && item.offerPrice && (
                    <>
                      <p className="font-semibold">
                        Offer Price: {formatCurrency(item.offerPrice, 'BDT')}
                      </p>
                      <p className="text-gray-500 italic">
                        (Original:{' '}
                        {formatCurrency(item.property.originalPrice, 'BDT')})
                      </p>
                      <p className="text-red-500 mt-2">
                        <strong>Status:</strong> Negotiation offer was rejected
                        by the seller.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
