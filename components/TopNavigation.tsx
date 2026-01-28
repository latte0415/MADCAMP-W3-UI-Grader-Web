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
      <nav className="w-full border-b-2 border-gray-200/50 bg-white/60 backdrop-blur-[80px] sticky top-0 z-50 shadow-[0_8px_32px_0_rgba(0,0,0,0.08)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/40 before:via-white/20 before:to-transparent before:opacity-60 before:pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="text-gray-600 text-sm">Home</div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gradient-to-r from-gray-300/30 via-gray-400/20 to-gray-300/30 animate-pulse rounded-lg backdrop-blur-sm border border-gray-200/50"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="w-full border-b-2 border-gray-200/50 bg-white/60 backdrop-blur-[80px] sticky top-0 z-50 shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.8)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/40 before:via-white/20 before:to-transparent before:opacity-60 before:pointer-events-none after:absolute after:inset-[1px] after:bg-gradient-to-b after:from-transparent after:via-white/30 after:to-white/50 after:pointer-events-none">
        {/* Animated border glow */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gray-300/40 to-transparent animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className={`text-sm font-semibold transition-all hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.2)] relative group ${
                  pathname === '/' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Home
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-gray-600 to-gray-400 transition-all duration-300 ${
                    pathname === '/' ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                ></span>
              </Link>
              {user && (
                <Link
                  href="/library"
                  className={`text-sm font-semibold transition-all hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.2)] relative group ${
                    pathname === '/library' ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Library
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-gray-500 to-gray-300 transition-all duration-300 ${
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
                  className="px-5 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-all rounded-lg hover:bg-gray-100/80 backdrop-blur-sm border border-gray-200/60 hover:border-gray-300/80 shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.12)]"
                >
                  Sign Out
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="relative px-6 py-2 text-xs font-bold text-white bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 hover:from-gray-700 hover:via-gray-600 hover:to-gray-700 rounded-lg transition-all duration-200 shadow-[0_0_20px_rgba(0,0,0,0.15),0_4px_12px_0_rgba(0,0,0,0.1)] hover:shadow-[0_0_30px_rgba(0,0,0,0.2),0_6px_20px_0_rgba(0,0,0,0.15)] hover:scale-105 active:scale-95 backdrop-blur-sm border-2 border-gray-600/30 before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
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
