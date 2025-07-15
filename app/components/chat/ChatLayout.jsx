'use client'

import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import ChatList from './ChatList'
import ChatWindow from './ChatWindow'

const ChatLayout = ({ userRole }) => {
  const { data: session } = useSession()
  const params = useParams()
  const { chatId } = params

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Please sign in to access your messages</p>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <div className="w-1/3 h-full">
        <ChatList activeChat={chatId} userRole={userRole} />
      </div>

      <div className="w-2/3 h-full">
        <ChatWindow
          chatId={chatId}
          userEmail={session.user.email}
          userRole={userRole}
        />
      </div>
    </div>
  )
}

export default ChatLayout
