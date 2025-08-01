'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import ChatLayout from './ChatLayout'

export default function BuyerChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'buyer') {
      router.push('/')
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (status === 'authenticated' && session.user.role === 'buyer') {
    return <ChatLayout userRole="buyer" />
  }

  return null
}
