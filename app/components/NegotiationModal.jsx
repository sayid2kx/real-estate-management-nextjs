'use client'
import { useState } from 'react'

const NegotiationModal = ({ selectedProperties, onClose, onSubmit }) => {
  const [negotiations, setNegotiations] = useState(
    selectedProperties.map((property) => ({
      propertyId: property._id,
      message: '',
      offerPrice: '', // Changed from Math.round(property.price * 0.9) to ''
      error: '',
    })),
  )

  const handleChange = (propertyId, field, value) => {
    setNegotiations((prev) =>
      prev.map((neg) => {
        if (neg.propertyId !== propertyId) return neg

        let updated = { ...neg, [field]: value }

        const originalPrice =
          selectedProperties.find((p) => p._id === propertyId)?.price || 0

        if (field === 'offerPrice') {
          // Allow empty input to clear the field
          if (value === '') {
            updated.offerPrice = ''
            updated.error = ''
            return updated
          }

          const val = parseInt(value, 10)

          if (isNaN(val) || val <= 0) {
            updated.error = 'Offer price must be greater than 0.'
          } else if (val > originalPrice) {
            updated.error = `Offer price cannot exceed list price of BDT ${originalPrice.toLocaleString()}.`
          } else {
            updated.error = ''
          }

          updated.offerPrice = val
        }

        return updated
      }),
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Check for empty offerPrice or errors
    const hasError = negotiations.some(
      (neg) => neg.error || neg.offerPrice === '' || neg.offerPrice == null,
    )
    if (hasError) {
      setNegotiations((prev) =>
        prev.map((neg) => {
          if (neg.offerPrice === '' || neg.offerPrice == null) {
            return { ...neg, error: 'Offer price is required.' }
          }
          return neg
        }),
      )
      return
    }

    const sanitized = negotiations.map(({ error, ...valid }) => valid)
    onSubmit(sanitized)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Negotiate Properties</h2>
        <form onSubmit={handleSubmit}>
          {negotiations.map((neg) => {
            const property = selectedProperties.find(
              (p) => p._id === neg.propertyId,
            )
            return (
              <div
                key={neg.propertyId}
                className="mb-6 pb-6 border-b border-gray-200 last:border-0"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {property.propertyTitle}
                </h3>
                <div className="text-gray-600 mb-4">
                  List Price: {property.price?.toLocaleString() || 'N/A'} BDT
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    Your Offer (BDT)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={neg.offerPrice}
                    onChange={(e) =>
                      handleChange(neg.propertyId, 'offerPrice', e.target.value)
                    }
                    className={`w-full p-2 border rounded ${
                      neg.error ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {neg.error && (
                    <p className="text-sm text-red-600 mt-1">{neg.error}</p>
                  )}
                </div>

                <div className="mb-2">
                  <label className="block text-gray-700 mb-2">
                    Additional Message (Optional)
                  </label>
                  <textarea
                    value={neg.message}
                    onChange={(e) =>
                      handleChange(neg.propertyId, 'message', e.target.value)
                    }
                    className="w-full p-2 border border-gray-300 rounded h-24"
                    placeholder="Add any special requests or notes..."
                  />
                </div>
              </div>
            )
          })}

          <div className="flex justify-end gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={negotiations.some(
                (n) => n.error || n.offerPrice === '' || n.offerPrice == null,
              )}
            >
              Submit Negotiation
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NegotiationModal
