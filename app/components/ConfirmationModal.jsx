// app/components/ConfirmationModal.jsx
import React from 'react'

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 m-4 max-w-2xl w-full min-h-[250px] flex flex-col justify-between">
        <div>
          <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {title}
          </h3>
          <p className="text-xl text-gray-700 leading-relaxed text-center mb-8">
            {message}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mt-6">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-10 py-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-xl font-medium shadow-sm hover:shadow-md"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 sm:flex-none px-10 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xl font-medium shadow-sm hover:shadow-md"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
