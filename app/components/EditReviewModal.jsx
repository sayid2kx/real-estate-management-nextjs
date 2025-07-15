'use client'
import { useState } from 'react'

const EditReviewModal = ({ property, existingReview, onClose, onSubmit }) => {
  const [reviewMessage, setReviewMessage] = useState(
    existingReview.buyerMessage || '',
  )
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reviewMessage.trim()) {
      setError('Review message cannot be empty.')
      return
    }
    try {
      await onSubmit(property._id, reviewMessage, existingReview.rating)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to update review.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">
          Edit Review for {property.propertyTitle}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              value={reviewMessage}
              onChange={(e) => setReviewMessage(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Write your review here..."
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditReviewModal
