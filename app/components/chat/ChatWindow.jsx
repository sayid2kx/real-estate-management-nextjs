'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'

const ChatWindow = ({ chatId, userEmail, userRole, onBack }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [chatInfo, setChatInfo] = useState(null)

  const messagesContainerRef = useRef(null)

  const fetchMessages = useCallback(async () => {
    if (!chatId) return

    try {
      const res = await fetch(`/api/chat/${chatId}/messages`)
      if (!res.ok) throw new Error('Failed to fetch messages')

      const data = await res.json()
      setMessages(data.messages)
      setError(null)
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [chatId])

  const fetchChatInfo = useCallback(async () => {
    if (!chatId) return

    try {
      const res = await fetch('/api/chat/get-chats')
      if (!res.ok) throw new Error('Failed to fetch chat information')

      const data = await res.json()
      const currentChat = data.chats.find((chat) => chat._id === chatId)
      if (currentChat) setChatInfo(currentChat)
    } catch (err) {
      console.error('Error fetching chat info:', err)
    }
  }, [chatId])

  useEffect(() => {
    if (chatId) {
      setLoading(true)
      fetchMessages()
      fetchChatInfo()

      const intervalId = setInterval(fetchMessages, 10000)
      return () => clearInterval(intervalId)
    }
  }, [chatId, fetchMessages, fetchChatInfo])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    try {
      setSending(true)

      // Optimistic update
      const tempId = `temp-${Date.now()}`
      const tempMessage = {
        _id: tempId,
        content: newMessage,
        sender: userEmail,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
      }

      setMessages((prev) => [...prev, tempMessage])
      setNewMessage('')

      // Send to server
      const res = await fetch(`/api/chat/${chatId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      const data = await res.json()

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempId ? data.messageData : msg)),
      )

      fetchChatInfo()
    } catch (err) {
      console.error('Error sending message:', err)
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId))
      setNewMessage(newMessage) // Restore message
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center bg-white">
        <button
          onClick={onBack}
          className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {chatInfo ? (
          <div className="flex items-center">
            {chatInfo.otherParty?.image ? (
              <img
                src={chatInfo.otherParty.image}
                alt={chatInfo.otherParty.fullname}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                <span className="text-blue-800 font-semibold">
                  {chatInfo.otherParty?.fullname?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div className="ml-3">
              <h3 className="font-semibold text-gray-900">
                {chatInfo.otherParty?.fullname || 'Unknown'}
              </h3>
              <p className="text-xs text-blue-600 font-medium">
                {chatInfo.property?.propertyTitle || 'Unknown Property'}
              </p>
            </div>
          </div>
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

      {/* Messages Area - Light gray background */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
      >
        {loading ? (
          <div className="flex flex-col h-full justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-3 text-gray-500">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col h-full justify-center items-center text-red-500 px-4">
            <p>{error}</p>
            <button
              onClick={fetchMessages}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col h-full justify-center items-center text-gray-500 px-4">
            <div className="text-center max-w-xs">
              <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
              <h3 className="font-medium text-lg mb-1">No messages yet</h3>
              <p className="text-sm">
                Send a message to start the conversation
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {messages.map((message) => {
              const isCurrentUser = message.sender === userEmail
              return (
                <div
                  key={message._id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
                      isCurrentUser
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                    } ${message.isOptimistic ? 'opacity-80' : ''}`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1.5 ${
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
          </div>
        )}
      </div>

      {/* Floating Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="sticky bottom-0 p-4 bg-white border-t border-gray-200"
      >
        <div className="flex items-center rounded-full bg-gray-100 pl-4 pr-2 py-2 shadow-sm">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className={`
              ml-2 w-10 h-10 rounded-full flex items-center justify-center
              ${
                sending || !newMessage.trim()
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300
            `}
          >
            {sending ? (
              <svg
                className="animate-spin h-5 w-5"
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
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatWindow
