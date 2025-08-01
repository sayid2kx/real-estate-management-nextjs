'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

const ChatList = ({ activeChat = null, userRole, onSelectChat }) => {
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/get-chats')
      if (!res.ok) throw new Error('Failed to fetch chats')

      const data = await res.json()
      setChats((prev) => {
        const newChats = data.chats
        if (JSON.stringify(prev) === JSON.stringify(newChats)) return prev
        return newChats
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching chats:', err)
      setError('Failed to load conversations')
    }
  }, [])

  useEffect(() => {
    fetchChats()
    const intervalId = setInterval(fetchChats, 15000)

    return () => clearInterval(intervalId)
  }, [fetchChats])

  useEffect(() => {
    if (chats.length > 0) setLoading(false)
  }, [chats])

  const handleChatSelect = (chatId) => {
    onSelectChat?.()
    router.push(`/${userRole}/dashboard/chat/${chatId}`)
  }

  // Skeleton loader
  if (loading) {
    return (
      <div className="flex flex-col h-full w-full p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center p-3 bg-white rounded-xl animate-pulse"
          >
            <div className="rounded-full bg-gray-200 h-12 w-12"></div>
            <div className="ml-3 flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center text-red-500 px-4 py-8">
        <p>{error}</p>
        <button
          onClick={fetchChats}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center text-gray-500 px-4 py-8">
        <div className="bg-white p-6 rounded-2xl text-center max-w-md shadow-sm">
          <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
          <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
          <p className="text-sm mb-4">
            Start a conversation by contacting a property owner
          </p>
          <Link
            href={`/${userRole}/dashboard`}
            className="inline-block px-5 py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
          >
            Browse Properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="sticky top-0 bg-blue-50 z-10 p-4 border-b border-blue-100">
        <h2 className="font-bold text-xl text-gray-800">Messages</h2>
      </div>
      <div className="p-3">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => handleChatSelect(chat._id)}
            className={`
              flex items-center p-3 rounded-xl mb-2 cursor-pointer transition-all
              ${
                activeChat === chat._id
                  ? 'bg-white border border-blue-200 shadow-sm'
                  : 'bg-white hover:bg-blue-100'
              }
            `}
          >
            <div className="relative flex-shrink-0">
              {chat.otherParty?.image ? (
                <img
                  src={chat.otherParty.image}
                  alt={chat.otherParty.fullname}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-blue-800 font-semibold text-lg">
                    {chat.otherParty?.fullname?.charAt(0) || '?'}
                  </span>
                </div>
              )}

              {chat.unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {chat.unreadCount}
                </span>
              )}
            </div>

            <div className="ml-3 flex-1 overflow-hidden min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 truncate">
                  {chat.otherParty?.fullname || 'Unknown'}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                  {chat.lastMessageTime
                    ? formatDistanceToNow(new Date(chat.lastMessageTime), {
                        addSuffix: true,
                      })
                    : ''}
                </span>
              </div>

              <div className="flex justify-between items-center mt-0.5">
                <p className="text-sm text-gray-600 truncate">
                  {chat.lastMessage || 'No messages yet'}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full ml-2"></span>
                )}
              </div>

              <p className="text-xs text-blue-600 truncate mt-0.5 font-medium">
                Re: {chat.property?.propertyTitle || 'Unknown Property'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChatList
