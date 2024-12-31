'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import EditModal from './EditModel'
import DeleteModal from './DeleteModel'

const SellerPropertiesShow = () => {
  const { data: session } = useSession()
  const [properties, setProperties] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [propertyToEdit, setPropertyToEdit] = useState(null)
  const [formData, setFormData] = useState({})
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (session) {
      fetchProperties(session.user.email)
    }
  }, [session])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 1500)
      return () => clearTimeout(timer)
    }
  }, [message])

  const fetchProperties = async (email) => {
    try {
      const res = await fetch(`/api/seller/property/${email}`)
      if (res.ok) {
        const data = await res.json()
        setProperties(data)
      } else {
        console.error('Error fetching properties', res.status)
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    }
  }

  const handleDelete = async () => {
    if (!propertyToDelete) return

    setIsDeleting(true)

    try {
      const res = await fetch(
        `/api/seller/delete-property/${propertyToDelete._id}`,
        {
          method: 'DELETE',
        },
      )

      if (res.ok) {
        setProperties(properties.filter((p) => p._id !== propertyToDelete._id))
        setDialogOpen(false)
        setPropertyToDelete(null)
        setMessage('Property deleted successfully!')
      } else {
        setMessage('Failed to delete property. Please try again.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const openDialog = (property) => {
    setPropertyToDelete(property)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setPropertyToDelete(null)
  }

  const openEditModal = (property) => {
    setPropertyToEdit(property)
    setFormData(property)
    setEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditModalOpen(false)
    setPropertyToEdit(null)
    setFormData({})
    setMessage('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleUpdate = async () => {
    if (!propertyToEdit) return

    try {
      const res = await fetch(
        `/api/seller/update-property/${propertyToEdit._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        },
      )

      if (res.ok) {
        const updatedProperty = await res.json()
        setProperties(
          properties.map((p) =>
            p._id === updatedProperty._id ? updatedProperty : p,
          ),
        )
        closeEditModal()
        setMessage('Property updated successfully!')
      } else {
        setMessage('Failed to update property. Please try again.')
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    }
  }

  if (properties.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 to-sky-200">
        <Link
          href="/seller/dashboard/add-property"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-transform transform hover:scale-110"
        >
          Add Property
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4">
      {message && (
        <div
          className={`p-4 mb-4 ${
            message.includes('success') ? 'bg-green-100' : 'bg-red-100'
          } text-${
            message.includes('success') ? 'green-700' : 'red-700'
          } rounded-lg`}
        >
          {message}
        </div>
      )}
      <ul className="space-y-8">
        {properties.map((property) => (
          <li
            key={property._id}
            className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col md:flex-row"
          >
            <Link
              href={`/seller/dashboard/all-properties/${property._id}`}
              className="w-full md:w-1/3"
            >
              <div className="relative h-48 md:h-full cursor-pointer">
                {property.image ? (
                  <img
                    src={property.image}
                    alt={property.propertyTitle}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full"></div>
                )}
              </div>
            </Link>
            <div className="w-full md:w-2/3 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {property.propertyTitle}
              </h2>
              <p className="text-lg text-gray-600 mb-4">
                {property.propertyType} -{' '}
                <span className="font-semibold">
                  {property.price.toLocaleString()} BDT
                </span>
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {property.address}, {property.district?.name || 'N/A'},{' '}
                {property.division?.name || 'N/A'}
              </p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                <p>
                  <strong>Bedrooms:</strong> {property.bedrooms}
                </p>
                <p>
                  <strong>Bathrooms:</strong> {property.bathrooms}
                </p>
                <p>
                  <strong>Total Area:</strong> {property.totalArea} sqft
                </p>
                <p>
                  <strong>Year Built:</strong> {property.yearBuilt}
                </p>
              </div>
              <div className="flex space-x-6 mt-4">
                <div
                  className="flex items-center cursor-pointer bg-blue-100 border border-blue-400 rounded-full p-2 hover:bg-blue-200 transition-colors"
                  onClick={() => openEditModal(property)}
                >
                  <Image
                    src="/icons/edit1.svg"
                    alt="Edit"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  <span className="text-gray-800 font-semibold">Edit</span>
                </div>
                <div
                  className="flex items-center cursor-pointer bg-red-100 border border-red-400 rounded-full p-2 hover:bg-red-200 transition-colors"
                  onClick={() => openDialog(property)}
                >
                  <Image
                    src="/icons/delete1.svg"
                    alt="Delete"
                    width={24}
                    height={24}
                    className="mr-2"
                  />
                  <span className="text-gray-800 font-semibold">Delete</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <DeleteModal
        isOpen={dialogOpen}
        onClose={closeDialog}
        propertyToDelete={propertyToDelete}
        isDeleting={isDeleting}
        onDelete={handleDelete}
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        formData={formData}
        onInputChange={handleInputChange}
        onUpdate={handleUpdate}
      />
    </div>
  )
}

export default SellerPropertiesShow
