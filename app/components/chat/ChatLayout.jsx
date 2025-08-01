'use client'

import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'
import { useState } from 'react'

const ChatLayout = ({ userRole }) => {
  const { data: session } = useSession()
  const params = useParams()
  const { chatId } = params
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please sign in to access your messages</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-80px)] relative">
      {/* Chat List - Light blue background */}
      <div
        className={`w-full md:w-1/3 h-full bg-blue-50 ${isMobileChatOpen ? 'hidden md:block' : 'block'}`}
      >
        <ChatList
          activeChat={chatId}
          userRole={userRole}
          onSelectChat={() => setIsMobileChatOpen(true)}
        />
      </div>

      {/* Chat Window - White background */}
      <div
        className={`w-full md:w-2/3 h-full bg-white ${chatId ? 'block' : 'hidden md:block'}`}
      >
        {chatId && (
          <ChatWindow
            chatId={chatId}
            userEmail={session.user.email}
            userRole={userRole}
            onBack={() => setIsMobileChatOpen(false)}
          />
        )}

        {!chatId && (
          <div className="flex flex-col h-full w-full items-center justify-center text-gray-500 p-4">
            <div className="text-center max-w-md">
              <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No conversation selected
              </h3>
              <p className="text-sm">
                Select a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatLayout
