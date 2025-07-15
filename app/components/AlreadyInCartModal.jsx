// components/AlreadyInCartModal.jsx
const AlreadyInCartModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-md">
      <h2 className="text-xl font-semibold text-red-600 mb-4">
        Property already in the cart
      </h2>
      <p className="text-gray-700 mb-4">
        You've already added this property to your cart.
      </p>
      <button
        onClick={onClose}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Close
      </button>
    </div>
  </div>
)

export default AlreadyInCartModal
