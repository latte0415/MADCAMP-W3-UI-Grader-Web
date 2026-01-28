'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { apiClient } from '@/lib/api/client'
import TopNavigation from '@/components/TopNavigation'
import LoginModal from '@/components/LoginModal'

export default function Home() {
  const [url, setUrl] = useState('')
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleAnalyze = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    // Supabase 세션에서 액세스 토큰 가져오기
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session?.access_token) {
      setErrorMessage('인증 토큰을 가져올 수 없습니다. 다시 로그인해주세요.')
      return
    }

    // 기본 URL 형식 검증
    const urlPattern = /^https?:\/\/.+/i
    if (!urlPattern.test(url)) {
      setErrorMessage('올바른 URL 형식을 입력해주세요. (예: https://example.com)')
      return
    }

    setIsValidating(true)
    setErrorMessage(null)

    try {
      // URL 유효성 검사
      const validationResult = await apiClient.validateUrl(url)
      
      if (!validationResult.valid) {
        setErrorMessage(validationResult.message || 'URL에 접근할 수 없습니다.')
        setIsValidating(false)
        return
      }

      // 분석 시작 (토큰 전달)
      const analyzeResult = await apiClient.analyzeUrl(url, session.access_token)
      
      // 라이브러리 페이지로 리다이렉트
      router.push('/library')
    } catch (error) {
      console.error('Analysis error:', error)
      if (error instanceof Error) {
        // 네트워크 에러인 경우 더 친화적인 메시지
        if (error.message.includes('연결할 수 없습니다')) {
          setErrorMessage(
            '백엔드 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.'
          )
        } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          setErrorMessage('인증에 실패했습니다. 다시 로그인해주세요.')
        } else {
          setErrorMessage(error.message || '분석 중 오류가 발생했습니다.')
        }
      } else {
        setErrorMessage('알 수 없는 오류가 발생했습니다.')
      }
    } finally {
      setIsValidating(false)
    }
  }

  const isUrlValid = url.trim().length > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Subtle grid system */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>
      
      {/* Refined gradient orbs - 미묘하고 세련된 */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 animate-float-slow" style={{background: 'radial-gradient(circle, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 50%, transparent 70%)'}}></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-25 animate-float-delayed" style={{background: 'radial-gradient(circle, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.03) 50%, transparent 70%)'}}></div>
      
      {/* Minimal circuit patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-32 left-16 w-px h-24 bg-gradient-to-b from-gray-400/40 to-transparent"></div>
        <div className="absolute bottom-40 right-20 w-24 h-px bg-gradient-to-r from-gray-400/40 to-transparent"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-px bg-gradient-to-r from-transparent via-gray-400/30 to-transparent"></div>
      </div>
      
      {/* Refined blueprint elements - 트렌디하고 세련된 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Component wireframe - 좌측 상단 */}
        <div className="absolute top-32 left-16 w-48 h-32 backdrop-blur-[60px] bg-white/50 border border-gray-300/40 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.6)] opacity-30">
          <div className="p-3 space-y-2">
            <div className="h-2.5 bg-white/60 backdrop-blur-[20px] rounded w-3/4 border border-gray-200/30"></div>
            <div className="h-3 bg-white/60 backdrop-blur-[20px] rounded w-full border border-gray-200/30"></div>
            <div className="h-3 bg-white/60 backdrop-blur-[20px] rounded w-2/3 border border-gray-200/30"></div>
          </div>
          <div className="absolute top-2 right-2 text-[10px] text-gray-600 font-mono backdrop-blur-[20px] bg-white/50 px-2 py-0.5 rounded border border-gray-200/30">Component</div>
        </div>
        
        {/* Structure diagram - 우측 하단 */}
        <div className="absolute bottom-40 right-20 w-52 h-36 backdrop-blur-[60px] bg-white/50 border border-gray-300/40 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.6)] opacity-30">
          <div className="p-3">
            <div className="text-[10px] text-gray-600 font-mono mb-2 backdrop-blur-[20px] bg-white/50 px-2 py-0.5 rounded border border-gray-200/30 inline-block">Structure</div>
            <div className="space-y-1.5">
              <div className="h-3 bg-white/60 backdrop-blur-[20px] rounded border border-gray-200/30"></div>
              <div className="h-3 bg-white/60 backdrop-blur-[20px] rounded ml-3 border border-gray-200/30"></div>
              <div className="h-3 bg-white/60 backdrop-blur-[20px] rounded ml-6 border border-gray-200/30"></div>
            </div>
          </div>
        </div>
        
        {/* Measurement line - 중앙 상단 */}
        <div className="absolute top-48 left-1/2 -translate-x-1/2 opacity-20">
          <div className="relative">
            <div className="w-32 h-px bg-gray-400/50"></div>
            <div className="absolute left-0 -top-0.5 w-px h-2 bg-gray-400/50"></div>
            <div className="absolute right-0 -top-0.5 w-px h-2 bg-gray-400/50"></div>
            <div className="absolute left-1/2 -top-5 -translate-x-1/2 px-2 py-1 backdrop-blur-[40px] bg-white/60 border border-gray-200/40 rounded-lg text-[10px] text-gray-700 font-mono shadow-sm">640px</div>
          </div>
        </div>
        
        {/* Flow diagram - 좌측 하단 */}
        <div className="absolute bottom-48 left-24 w-40 opacity-20">
          <div className="backdrop-blur-[50px] bg-white/45 border border-gray-300/40 rounded-xl p-3 shadow-[0_4px_16px_0_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.5)]">
            <svg className="w-full" viewBox="0 0 160 64">
              <defs>
                <marker id="arrow-refined" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                  <polygon points="0 0, 4 2, 0 4" fill="gray" opacity="0.4" />
                </marker>
              </defs>
              <rect x="8" y="20" width="24" height="24" fill="rgba(255,255,255,0.4)" stroke="gray" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" rx="2"/>
              <path d="M 32 32 L 64 32" stroke="gray" strokeWidth="1" strokeDasharray="2,2" fill="none" opacity="0.4" markerEnd="url(#arrow-refined)"/>
              <rect x="64" y="20" width="24" height="24" fill="rgba(255,255,255,0.4)" stroke="gray" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" rx="2"/>
              <path d="M 88 32 L 120 32" stroke="gray" strokeWidth="1" strokeDasharray="2,2" fill="none" opacity="0.4" markerEnd="url(#arrow-refined)"/>
              <rect x="120" y="20" width="24" height="24" fill="rgba(255,255,255,0.4)" stroke="gray" strokeWidth="1" strokeDasharray="2,2" opacity="0.4" rx="2"/>
            </svg>
          </div>
        </div>
        
        {/* Design system - 우측 상단 */}
        <div className="absolute top-40 right-20 backdrop-blur-[60px] bg-white/55 border border-gray-300/40 rounded-2xl p-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.08),inset_0_1px_0_0_rgba(255,255,255,0.6)] opacity-30">
          <div className="text-[10px] text-gray-700 font-mono mb-1.5 backdrop-blur-[20px] bg-white/50 px-2 py-0.5 rounded border border-gray-200/30 inline-block">Design System</div>
          <div className="space-y-0.5 text-[10px] text-gray-600 font-mono">
            <div>Spacing: 4, 8, 16</div>
            <div>Radius: 4, 8, 12</div>
          </div>
        </div>
      </div>
      
      <TopNavigation />
      
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold mb-4 leading-tight tracking-tight">
            <span className="block text-gray-950">
              Website
            </span>
            <span className="block mt-2 text-gray-900">
              UI/UX Analysis
            </span>
          </h1>
          <p className="text-sm text-gray-600 mb-10 font-medium tracking-wide uppercase">
            AI-driven heuristic evaluation
          </p>
          {/* Minimal decorative elements */}
          <div className="flex justify-center gap-2 mb-10">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400/60 animate-pulse"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400/60 animate-pulse delay-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400/60 animate-pulse delay-700"></div>
          </div>
        </div>

        {/* Input section - 트렌디하고 세련된 */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setErrorMessage(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isUrlValid) {
                    handleAnalyze()
                  }
                }}
                placeholder="https://example.com"
                className="w-full px-5 py-3.5 bg-white/70 backdrop-blur-[40px] border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400/60 text-base text-gray-900 placeholder:text-gray-500/70 shadow-[0_4px_16px_0_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.8)] focus:shadow-[0_8px_24px_0_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition-all"
              />
              {url && !errorMessage && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={!isUrlValid || isValidating}
              className="px-6 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-base whitespace-nowrap transition-all shadow-[0_4px_12px_0_rgba(0,0,0,0.15)] hover:shadow-[0_6px_16px_0_rgba(0,0,0,0.2)]"
            >
              {isValidating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isValidating ? 'Analyzing...' : 'Validating'}
                </span>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
          {errorMessage && (
            <div className="px-4 py-3 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl text-sm text-red-700">
              {errorMessage}
            </div>
          )}
        </div>
      </main>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  )
}
