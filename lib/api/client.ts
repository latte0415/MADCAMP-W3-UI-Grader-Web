import { ValidateUrlResponse, AnalyzeResponse, SiteEvaluation, ApiError, RunsListResponse, EvaluationResultResponse } from '@/types/api'

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit & { authToken?: string }
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // 헤더 초기화
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // 기존 헤더가 있으면 병합
    if (options?.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value
        })
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value
        })
      } else {
        Object.assign(headers, options.headers)
      }
    }

    // 인증 토큰이 있으면 추가
    if (options?.authToken) {
      headers['Authorization'] = `Bearer ${options.authToken}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          detail: `HTTP error! status: ${response.status}`,
        }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      // 네트워크 에러 처리
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          `백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요. (${this.baseUrl})`
        )
      }

      if (error instanceof Error) {
        // CORS 에러 감지
        if (error.message.includes('CORS') || error.message.includes('CORS')) {
          throw new Error('CORS 오류가 발생했습니다. 백엔드 서버의 CORS 설정을 확인해주세요.')
        }
        throw error
      }

      throw new Error('알 수 없는 네트워크 오류가 발생했습니다.')
    }
  }

  async validateUrl(url: string): Promise<ValidateUrlResponse> {
    const params = new URLSearchParams({ url })
    return this.request<ValidateUrlResponse>(`/api/evaluation/validate?${params}`)
  }

  async analyzeUrl(
    url: string,
    authToken: string,
    startUrl?: string,
    runMemoryPreset?: Record<string, string>
  ): Promise<AnalyzeResponse> {
    const body: {
      url: string
      start_url?: string
      run_memory_preset?: Record<string, string>
    } = {
      url,
    }

    if (startUrl && startUrl !== url) {
      body.start_url = startUrl
    }

    if (runMemoryPreset && Object.keys(runMemoryPreset).length > 0) {
      body.run_memory_preset = runMemoryPreset
    }

    return this.request<AnalyzeResponse>('/api/evaluation/analyze', {
      method: 'POST',
      authToken,
      body: JSON.stringify(body),
    })
  }

  async getEvaluation(runId: string): Promise<SiteEvaluation> {
    return this.request<SiteEvaluation>(`/api/evaluation/${runId}?include_details=true`)
  }

  async getRuns(
    authToken: string,
    options?: {
      limit?: number
      offset?: number
      status?: 'running' | 'completed' | 'failed' | 'stopped'
      order_by?: string
      order?: 'asc' | 'desc'
    }
  ): Promise<RunsListResponse> {
    const params = new URLSearchParams()
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.offset) params.append('offset', options.offset.toString())
    if (options?.status) params.append('status', options.status)
    if (options?.order_by) params.append('order_by', options.order_by)
    if (options?.order) params.append('order', options.order)

    const queryString = params.toString()
    const endpoint = queryString ? `/api/runs?${queryString}` : '/api/runs'

    return this.request<RunsListResponse>(endpoint, {
      authToken,
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
