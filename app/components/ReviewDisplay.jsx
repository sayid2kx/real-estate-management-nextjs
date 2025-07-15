'use client'
import { useState } from 'react'

const ReviewDisplay = ({ review }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-xl ${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>,
      )
    }
    return stars
  }

  const displayMessage = isExpanded
    ? review.buyerMessage
    : `${review.buyerMessage.substring(0, 150)}${
        review.buyerMessage.length > 150 ? '...' : ''
      }`
  const needsExpansion = review.buyerMessage.length > 150

  return (
    <div className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-semibold text-gray-700">
          Review by: {review.buyerName || 'Unknown Buyer'}
        </p>
        <div className="flex items-center">{renderStars(review.rating)}</div>
      </div>
      <p className="text-gray-700 text-sm mb-2">{displayMessage}</p>
      {needsExpansion && (
        <button
          onClick={toggleExpand}
          className="text-blue-600 hover:underline text-sm focus:outline-none"
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      )}
    </div>
  )
}

export default ReviewDisplay
