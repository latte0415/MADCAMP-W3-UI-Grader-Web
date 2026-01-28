'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import LoginModal from './LoginModal'

export default function TopNavigation() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    // 현재 사용자 확인
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setIsLoading(false)
    })

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  if (isLoading) {
    return (
      <nav className="w-full border-b border-gray-200/70 bg-white/80 backdrop-blur-[80px] sticky top-0 z-50 shadow-[0_4px_16px_0_rgba(0,0,0,0.06)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/50 before:via-white/30 before:to-transparent before:opacity-70 before:pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-10">
              <div className="text-gray-700 text-sm font-semibold">Home</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-200/60 animate-pulse rounded-lg border border-gray-200/70"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="w-full border-b border-gray-200/70 bg-white/80 backdrop-blur-[80px] sticky top-0 z-50 shadow-[0_4px_16px_0_rgba(0,0,0,0.06)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/50 before:via-white/30 before:to-transparent before:opacity-70 before:pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-10">
              <Link
                href="/"
                className={`text-sm font-semibold transition-all relative group ${
                  pathname === '/' ? 'text-gray-950' : 'text-gray-700 hover:text-gray-950'
                }`}
              >
                Home
                <span
                  className={`absolute -bottom-1 left-0 h-[2px] bg-gray-900 transition-all duration-300 ${
                    pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </Link>
              {user && (
                <Link
                  href="/library"
                  className={`text-sm font-semibold transition-all relative group ${
                    pathname === '/library' ? 'text-gray-950' : 'text-gray-700 hover:text-gray-950'
                  }`}
                >
                  Library
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] bg-gray-900 transition-all duration-300 ${
                      pathname === '/library' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 text-sm font-medium text-gray-800 hover:text-gray-950 transition-all rounded-lg hover:bg-gray-100/90 backdrop-blur-sm border border-gray-200/70 hover:border-gray-300/90 shadow-sm hover:shadow-md"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="relative px-6 py-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  )
}
