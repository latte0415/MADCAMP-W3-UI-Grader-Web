// API 응답 타입 정의

export interface ValidateUrlResponse {
  valid: boolean
  url: string
  message: string
  details: {
    accessible: boolean
    status_code: number | null
    error: string | null
  }
}

export interface AnalyzeResponse {
  run_id: string
  status: string
  target_url: string
  start_url: string
  created_at: string
  message: string
}

export interface SiteEvaluation {
  id: string
  run_id: string
  timestamp: string
  total_score: number
  learnability_score: number
  efficiency_score: number
  control_score: number
  node_count: number
  edge_count: number
  path_count: number
  created_at: string
  target_url?: string
}

export interface SiteEvaluationListItem {
  id: string
  run_id: string
  target_url: string
  total_score: number
  learnability_score: number
  efficiency_score: number
  control_score: number
  created_at: string
  timestamp: string
  // 위험 요소 개수 계산용
  risk_count?: {
    high: number
    medium: number
    low: number
  }
}

export interface ApiError {
  detail: string
}

export interface RunListItem {
  run_id: string
  status: 'running' | 'completed' | 'failed' | 'stopped'
  target_url: string
  start_url: string
  created_at: string
  completed_at: string | null
  execution_time: number | null
  evaluation: {
    id: string
    total_score: number
    learnability_score: number
    efficiency_score: number
    control_score: number
    created_at: string
  } | null
}

export interface RunsListResponse {
  runs: RunListItem[]
  total: number
  limit: number
  offset: number
}
