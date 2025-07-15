'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'

const ChatWindow = ({ chatId, userEmail, userRole }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [chatInfo, setChatInfo] = useState(null)
  const messagesEndRef = useRef(null)

  const fetchMessages = async () => {
    if (!chatId) return

    try {
      setLoading(true)
      const res = await fetch(`/api/chat/${chatId}/messages`)

      if (!res.ok) {
        throw new Error('Failed to fetch messages')
      }

      const data = await res.json()
      setMessages(data.messages)
      setError(null)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const fetchChatInfo = async () => {
    if (!chatId) return

    try {
      const res = await fetch('/api/chat/get-chats')

      if (!res.ok) {
        throw new Error('Failed to fetch chat information')
      }

      const data = await res.json()
      const currentChat = data.chats.find((chat) => chat._id === chatId)

      if (currentChat) {
        setChatInfo(currentChat)
      }
    } catch (err) {
      console.error('Error fetching chat info:', err)
    }
  }

  useEffect(() => {
    if (chatId) {
      fetchMessages()
      fetchChatInfo()

      const intervalId = setInterval(fetchMessages, 5000)

      return () => clearInterval(intervalId)
    }
  }, [chatId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || sending) return

    try {
      setSending(true)

      const res = await fetch(`/api/chat/${chatId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      })

      if (!res.ok) {
        throw new Error('Failed to send message')
      }

      const data = await res.json()

      setMessages((prev) => [...prev, data.messageData])
      setNewMessage('')

      fetchChatInfo()
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (!chatId) {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center bg-gray-50 text-gray-500">
        <p>Select a conversation to start chatting</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex items-center">
        {chatInfo ? (
          <>
            {chatInfo.otherParty?.image ? (
              <img
                src={chatInfo.otherParty.image}
                alt={chatInfo.otherParty.fullname}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-semibold">
                  {chatInfo.otherParty?.fullname?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div className="ml-3">
              <h3 className="font-medium text-gray-900">
                {chatInfo.otherParty?.fullname || 'Unknown'}
              </h3>
              <p className="text-xs text-gray-500">
                Re: {chatInfo.property?.propertyTitle || 'Unknown Property'}
              </p>
            </div>
          </>
        ) : (
          <div className="animate-pulse flex items-center">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="ml-3 space-y-1">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-full text-red-500">
            <p>{error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.sender === userEmail
              return (
                <div
                  key={message._id}
                  className={`flex ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-lg ${
                      isCurrentUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200 bg-white"
      >
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className={`px-4 py-2 bg-blue-500 text-white rounded-r-md ${
              sending || !newMessage.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          >
            {sending ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Sending
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatWindow
