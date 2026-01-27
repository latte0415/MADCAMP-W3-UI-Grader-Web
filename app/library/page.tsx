'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { apiClient } from '@/lib/api/client'
import TopNavigation from '@/components/TopNavigation'
import { RunListItem } from '@/types/api'

export default function LibraryPage() {
  const [runs, setRuns] = useState<RunListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const loadRuns = async () => {
      const supabase = createClient()
      
      // 사용자 인증 확인
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (!user || authError) {
        router.push('/')
        return
      }

      // Supabase 세션에서 액세스 토큰 가져오기
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setError('인증 토큰을 가져올 수 없습니다.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // 백엔드 API로 runs 리스트 조회
        const response = await apiClient.getRuns(session.access_token, {
          order_by: 'created_at',
          order: 'desc',
        })

        setRuns(response.runs)
      } catch (err) {
        console.error('Failed to load runs:', err)
        if (err instanceof Error) {
          setError(err.message || '평가 리스트를 불러오는 중 오류가 발생했습니다.')
        } else {
          setError('평가 리스트를 불러오는 중 오류가 발생했습니다.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadRuns()
  }, [router])

  const handleItemClick = (runId: string) => {
    // 추후 상세 화면 구현
    alert(`상세 화면은 추후 구현 예정입니다. (Run ID: ${runId})`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatExecutionTime = (seconds: number | null) => {
    if (!seconds) return null
    if (seconds < 60) return `${Math.round(seconds)}초`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}분 ${remainingSeconds}초`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'running':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'stopped':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료'
      case 'running':
        return '진행 중'
      case 'failed':
        return '실패'
      case 'stopped':
        return '중지됨'
      default:
        return status
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-50 border-green-200'
    if (score >= 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const getRiskCount = (score: number) => {
    return {
      high: score < 40 ? 1 : 0,
      medium: score >= 40 && score < 70 ? 1 : 0,
      low: score >= 70 ? 0 : 1,
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-white relative overflow-hidden">
      {/* Subtle grid system */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>
      
      {/* Refined gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 animate-float-slow" style={{background: 'radial-gradient(circle, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.04) 50%, transparent 70%)'}}></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-25 animate-float-delayed" style={{background: 'radial-gradient(circle, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.03) 50%, transparent 70%)'}}></div>
      
      <TopNavigation />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-gray-900">
            Library
          </h1>
          <p className="text-gray-600 text-sm font-medium tracking-wide uppercase">
            Your Website Evaluations
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600 text-sm">로딩 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="px-6 py-4 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl text-sm text-red-700">
            {error}
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-block p-8 bg-white/70 backdrop-blur-[40px] border border-gray-200/50 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.08)]">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-lg font-medium mb-2">아직 평가 요청이 없습니다</p>
              <p className="text-gray-500 text-sm">메인 페이지에서 웹사이트를 분석해보세요.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {runs.map((run) => {
              const isCompleted = run.status === 'completed' && run.evaluation
              const riskCount = isCompleted ? getRiskCount(run.evaluation.total_score) : null

              return (
                <div
                  key={run.run_id}
                  onClick={() => handleItemClick(run.run_id)}
                  className="group cursor-pointer bg-white/70 backdrop-blur-[40px] border border-gray-200/60 rounded-xl p-6 hover:border-gray-300/80 hover:bg-white/80 transition-all duration-200 shadow-[0_4px_16px_0_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.8)] hover:shadow-[0_8px_24px_0_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.9)]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {run.target_url}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(run.status)}`}>
                          {getStatusText(run.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>요청일: {formatDate(run.created_at)}</span>
                        {run.completed_at && (
                          <span>완료일: {formatDate(run.completed_at)}</span>
                        )}
                        {run.execution_time && (
                          <span>소요 시간: {formatExecutionTime(run.execution_time)}</span>
                        )}
                        {riskCount && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">위험 요소:</span>
                            {riskCount.high > 0 && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                                높음 {riskCount.high}
                              </span>
                            )}
                            {riskCount.medium > 0 && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                                보통 {riskCount.medium}
                              </span>
                            )}
                            {riskCount.low > 0 && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                                낮음 {riskCount.low}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isCompleted ? (
                        <div className={`px-4 py-2 rounded-lg border ${getScoreBgColor(run.evaluation.total_score)}`}>
                          <div className="text-xs text-gray-600 mb-1">총점</div>
                          <div className={`text-2xl font-bold ${getScoreColor(run.evaluation.total_score)}`}>
                            {run.evaluation.total_score.toFixed(1)}
                          </div>
                        </div>
                      ) : run.status === 'running' ? (
                        <div className="px-4 py-2 rounded-lg border border-blue-200 bg-blue-50">
                          <div className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm text-blue-700 font-medium">처리 중</span>
                          </div>
                        </div>
                      ) : (
                        <div className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50">
                          <div className="text-xs text-gray-600 mb-1">상태</div>
                          <div className="text-sm font-medium text-gray-700">
                            {getStatusText(run.status)}
                          </div>
                        </div>
                      )}
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
