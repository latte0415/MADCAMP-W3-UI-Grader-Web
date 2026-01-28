'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      console.error('Google login error:', error)
      setIsLoading(false)
    }
  }


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay with enhanced blur */}
      <div
        className="absolute inset-0 bg-white/80 backdrop-blur-[40px] animate-in fade-in"
        onClick={onClose}
      ></div>

      {/* Animated gradient orbs in background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gray-300/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-200/15 rounded-full blur-[100px] animate-pulse delay-700"></div>

      {/* Modal content - maximal glassmorphism */}
      <div className="relative bg-white/70 backdrop-blur-[100px] rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.8)] p-10 w-full max-w-md mx-4 border-2 border-gray-200/50 animate-in fade-in zoom-in-95 duration-200 before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-white/50 before:via-white/30 before:to-white/50 before:opacity-60 before:pointer-events-none after:absolute after:inset-[2px] after:rounded-3xl after:bg-gradient-to-br after:from-transparent after:via-white/40 after:to-white/60 after:pointer-events-none">
        {/* Outer glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-200/40 via-gray-300/30 to-gray-200/40 rounded-3xl blur-xl opacity-50"></div>
        <div className="flex justify-between items-center mb-10 relative z-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(0,0,0,0.1)]">
            Sign In
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-3xl leading-none transition-all w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100/80 backdrop-blur-sm border border-gray-200/60 hover:border-gray-300/80 shadow-[0_4px_12px_0_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_0_rgba(0,0,0,0.12)]"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 relative z-10">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full group flex items-center justify-center gap-4 px-6 py-5 bg-white/70 backdrop-blur-[40px] border-2 border-gray-200/60 rounded-xl hover:border-gray-300/80 hover:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_8px_32px_0_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.8)] hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.15),inset_0_1px_0_0_rgba(255,255,255,0.9)] hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r before:from-white/30 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-gray-900 font-semibold text-sm relative z-10">Continue with Google</span>
          </button>
        </div>

        {isLoading && (
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-gray-600 relative z-10">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </div>
        )}
      </div>
    </div>
  )
}
