'use client'
import React from 'react'

const StatusModal = ({ title, message, onClose, isSuccess }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-gray-300">
        <div
          className={`px-6 py-4 border-b ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          } rounded-t-2xl`}
        >
          <h2
            className={`text-lg font-bold ${
              isSuccess ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {title}
          </h2>
        </div>
        <div className="p-6 text-gray-800">
          <p>{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default StatusModal
