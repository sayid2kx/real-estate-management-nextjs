'use client'
import { useState } from 'react'

const ReviewModal = ({ property, onClose, onSubmit }) => {
  const [reviewMessage, setReviewMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleStarClick = (starValue) => {
    setRating(starValue)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reviewMessage.trim()) {
      setError('Review message cannot be empty.')
      return
    }
    if (rating < 1 || rating > 5) {
      setError('Please provide a rating between 1 and 5.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await onSubmit(property._id, reviewMessage, rating)
    } catch (err) {
      setError(err.message || 'Failed to submit review.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full mx-auto p-6 space-y-6 transform transition-all sm:align-middle">
        <h3 className="text-2xl font-bold text-gray-900 text-center">
          Write a Review
        </h3>

        <div className="border-t border-b border-gray-200 py-4 space-y-2">
          <p className="text-lg font-medium text-gray-800">
            Property: {property.propertyTitle}
          </p>
          {property.soldDetails ? (
            property.soldDetails.saleType === 'negotiation' ? (
              <div>
                <p className="text-md text-gray-600">
                  Original Price:{' '}
                  <span className="line-through">
                    {(property.price || 0).toLocaleString()} BDT
                  </span>
                </p>
                <p className="text-md text-green-700 font-semibold">
                  Sold Price:{' '}
                  {(property.soldDetails.finalPrice || 0).toLocaleString()} BDT
                </p>
              </div>
            ) : (
              <p className="text-md text-green-700 font-semibold">
                Sold Price:{' '}
                {(
                  property.soldDetails.finalPrice ||
                  property.price ||
                  0
                ).toLocaleString()}{' '}
                BDT
              </p>
            )
          ) : (
            <p className="text-md text-gray-700">
              Price: {(property.price || 0).toLocaleString()} BDT
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="rating"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Rating:
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <span
                  key={starValue}
                  className={`cursor-pointer text-2xl ${
                    starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => handleStarClick(starValue)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="reviewMessage"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Message for the Seller:
            </label>
            <textarea
              id="reviewMessage"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
              value={reviewMessage}
              onChange={(e) => setReviewMessage(e.target.value)}
              disabled={isLoading}
              placeholder="Write your review here..."
            ></textarea>
          </div>

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-md text-white ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50'
              } transition-colors duration-200 ease-in-out`}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal
