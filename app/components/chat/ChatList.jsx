'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const ChatList = ({ activeChat = null, userRole }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  const fetchChats = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/chat/get-chats')

      if (!res.ok) {
        throw new Error('Failed to fetch chats')
      }

      const data = await res.json()
      setChats(data.chats)
      setError(null)
    } catch (err) {
      console.error('Error fetching chats:', err)
      setError('Failed to load your conversations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChats()

    const intervalId = setInterval(fetchChats, 30000)

    return () => clearInterval(intervalId)
  }, [])

  const handleChatSelect = (chatId) => {
    router.push(`/${userRole}/dashboard/chat/${chatId}`)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-2 text-gray-500">Loading conversations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center text-red-500 px-4 py-8">
        <p>{error}</p>
        <button
          onClick={fetchChats}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center text-gray-500 px-4 py-8">
        <p className="text-center">No conversations yet</p>
        <Link
          href={`/${userRole}/dashboard`}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Browse Properties
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Conversations</h2>
      </div>
      <ul>
        {chats.map((chat) => (
          <li
            key={chat._id}
            onClick={() => handleChatSelect(chat._id)}
            className={`
              flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors
              ${activeChat === chat._id ? 'bg-blue-50' : ''}
            `}
          >
            <div className="relative">
              {chat.otherParty?.image ? (
                <img
                  src={chat.otherParty.image}
                  alt={chat.otherParty.fullname}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-lg">
                    {chat.otherParty?.fullname?.charAt(0) || '?'}
                  </span>
                </div>
              )}

              {chat.unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {chat.unreadCount}
                </span>
              )}
            </div>

            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900 truncate">
                  {chat.otherParty?.fullname || 'Unknown'}
                </h3>
                <span className="text-xs text-gray-500">
                  {chat.lastMessageTime
                    ? formatDistanceToNow(new Date(chat.lastMessageTime), {
                        addSuffix: true,
                      })
                    : ''}
                </span>
              </div>

              <div className="flex flex-col">
                <p className="text-xs text-gray-600 truncate font-medium">
                  Re: {chat.property?.propertyTitle || 'Unknown Property'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ChatList
