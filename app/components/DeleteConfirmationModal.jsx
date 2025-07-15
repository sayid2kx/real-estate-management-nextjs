'use client'
import React from 'react'

const DeleteConfirmationModal = ({ property, onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Are you sure you want to delete this property?
        </h2>
        <p className="text-gray-600 mb-6">{property.propertyTitle}</p>

        <div className="flex justify-between">
          <button
            onClick={onCancel}
            className="bg-gray-500 text-white py-2 px-6 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(property._id)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-md"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal
