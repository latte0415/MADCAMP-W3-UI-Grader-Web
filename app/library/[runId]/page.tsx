'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { apiClient } from '@/lib/api/client'
import TopNavigation from '@/components/TopNavigation'
import { SiteEvaluation, NodeEvaluation, EdgeEvaluation, WorkflowEvaluation } from '@/types/api'

export default function EvaluationDetailPage() {
    const { runId } = useParams()
    const [evaluation, setEvaluation] = useState<SiteEvaluation | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isPending, setIsPending] = useState(false) // 분석 진행 중 상태
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000'

    const loadEvaluation = useCallback(async () => {
        if (!runId) return

        try {
            const data = await apiClient.getEvaluation(runId as string)
            setEvaluation(transformEvaluationData(data))
            setIsPending(false)
            setError(null)
        } catch (err: any) {
            console.error('API fetch failed:', err)
            // 404 에러인 경우 분석 진행 중으로 처리
            if (err?.message?.includes('404')) {
                setIsPending(true)
                setError(null)
            } else {
                setError('평가 결과를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.')
                setIsPending(false)
            }
        } finally {
            setIsLoading(false)
        }
    }, [runId])

    // 초기 로드
    useEffect(() => {
        setIsLoading(true)
        loadEvaluation()
    }, [loadEvaluation])

    // 분석 진행 중일 때 5초마다 재조회
    useEffect(() => {
        if (!isPending) return

        const intervalId = setInterval(() => {
            console.log('Polling for evaluation result...')
            loadEvaluation()
        }, 5000) // 5초마다

        return () => clearInterval(intervalId)
    }, [isPending, loadEvaluation])

    const transformEvaluationData = (data: any): SiteEvaluation => {
        // 네트워크 탭의 실제 JSON 구조에 1:1 매핑 (완전 평면화된 상세 데이터 처리)

        // 1. Node Evaluations
        const nodeEvaluations: NodeEvaluation[] = (data.node_evaluations || []).map((node: any) => ({
            ...node,
            learnability_items: node.learnability_items || [],
            efficiency_items: node.efficiency_items || [],
            control_items: node.control_items || []
        }))

        // 2. Edge Evaluations (평면화된 필드를 콤포넌트가 기대하는 계층 구조로 복구)
        const edgeEvaluations: EdgeEvaluation[] = (data.edge_evaluations || []).map((edge: any) => ({
            edge_id: edge.edge_id,
            from_node_id: edge.from_node_id || nodeEvaluations[0]?.node_id || 'unknown',
            action: edge.action,
            result: {
                learnability: {
                    score: edge.learnability_score || 0,
                    passed: edge.learnability_passed || [],
                    failed: edge.learnability_failed || []
                },
                efficiency: {
                    score: edge.efficiency_score || 0,
                    passed: edge.efficiency_passed || [],
                    failed: edge.efficiency_failed || [],
                    latency: edge.latency_duration_ms ? {
                        duration_ms: edge.latency_duration_ms,
                        status: edge.latency_status,
                        description: edge.latency_description
                    } : undefined
                },
                control: {
                    score: edge.control_score || 0,
                    passed: edge.control_passed || [],
                    failed: edge.control_failed || []
                }
            }
        }))

        // 3. Workflow Evaluations (workflow_data 내부의 데이터를 추출)
        const workflowEvaluations: WorkflowEvaluation[] = (data.workflow_evaluations || []).map((wf: any) => {
            const rawWf = wf.workflow_data || {}
            return {
                path_index: rawWf.path_index,
                path_summary: rawWf.path_summary,
                result: {
                    learnability: rawWf.result?.learnability || { score: 0, passed: [], failed: [] },
                    efficiency: rawWf.result?.efficiency || { score: 0, passed: [], failed: [] },
                    control: rawWf.result?.control || { score: 0, passed: [], failed: [] }
                }
            }
        })

        // 4. Root 정보 매핑
        return {
            id: data.id || data.run_id,
            run_id: data.run_id,
            timestamp: data.timestamp,
            total_score: data.total_score || 0,
            learnability_score: data.learnability_score || 0,
            efficiency_score: data.efficiency_score || 0,
            control_score: data.control_score || 0,
            node_count: data.node_count || 0,
            edge_count: data.edge_count || 0,
            path_count: data.path_count || 0,
            created_at: data.created_at || data.timestamp,
            target_url: data.target_url || nodeEvaluations[0]?.url || '',
            node_evaluations: nodeEvaluations,
            edge_evaluations: edgeEvaluations,
            workflow_evaluations: workflowEvaluations
        }
    }

    const [activeTab, setActiveTab] = useState<'nodes' | 'interactions' | 'workflows'>('nodes')

    const getScoreColor = (score: number = 0) => {
        if (score >= 70) return 'text-green-600'
        if (score >= 40) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBgColor = (score: number = 0) => {
        if (score >= 70) return 'bg-green-50 border-green-200'
        if (score >= 40) return 'bg-yellow-50 border-yellow-200'
        return 'bg-red-50 border-red-200'
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white">
                <TopNavigation />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <svg className="animate-spin h-8 w-8 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-gray-600 text-sm">로딩 중...</p>
                    </div>
                </div>
            </div>
        )
    }

    // 분석 진행 중 상태
    if (isPending) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>
                <TopNavigation />
                <div className="relative z-10 max-w-4xl mx-auto pt-32 px-4">
                    <button
                        onClick={() => router.push('/library')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Library
                    </button>
                    <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-12 text-center shadow-lg">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <svg className="animate-spin h-16 w-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">분석 진행 중</h2>
                        <p className="text-gray-600 mb-2">웹사이트를 분석하고 있습니다.</p>
                        <p className="text-gray-500 text-sm mb-6">
                            전처리 및 평가 과정에 시간이 걸릴 수 있습니다.
                            <br />
                            완료되면 자동으로 결과가 표시됩니다.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-blue-600">
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                            <span>5초마다 자동 새로고침 중...</span>
                        </div>
                        <p className="text-gray-400 text-xs font-mono mt-4">Run ID: {runId}</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !evaluation) {
        return (
            <div className="min-h-screen bg-white">
                <TopNavigation />
                <div className="max-w-4xl mx-auto pt-32 px-4">
                    <button
                        onClick={() => router.push('/library')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Library
                    </button>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-700 mb-4">{error || '데이터를 찾을 수 없습니다.'}</p>
                        <button
                            onClick={() => router.push('/library')}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            목록으로 돌아가기
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:40px_40px] opacity-40"></div>

            <TopNavigation />

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24">
                {/* Header Summary */}
                <div className="mb-12">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Library
                    </button>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2 truncate max-w-2xl">
                                {evaluation.target_url}
                            </h1>
                            <p className="text-gray-500 font-mono text-sm">Run ID: {runId}</p>
                        </div>
                        <div className={`px-8 py-4 rounded-2xl border-2 shadow-sm ${getScoreBgColor(evaluation.total_score)}`}>
                            <div className="text-sm font-semibold text-gray-600 mb-1 uppercase tracking-wider text-center">Final Score</div>
                            <div className={`text-5xl font-black ${getScoreColor(evaluation.total_score)} text-center`}>
                                {evaluation.total_score.toFixed(1)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Learnability', score: evaluation.learnability_score },
                        { label: 'Efficiency', score: evaluation.efficiency_score },
                        { label: 'User Control', score: evaluation.control_score },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white/70 backdrop-blur-xl border border-gray-200/60 rounded-2xl p-6 shadow-sm">
                            <div className="text-gray-500 text-sm font-medium mb-2">{stat.label}</div>
                            <div className="flex items-end justify-between">
                                <div className={`text-3xl font-bold ${getScoreColor(stat.score)}`}>
                                    {stat.score.toFixed(1)}
                                </div>
                                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${stat.score >= 70 ? 'bg-green-500' : stat.score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${stat.score}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-gray-200 mb-12">
                    <button
                        onClick={() => setActiveTab('nodes')}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'nodes' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Pages (Nodes)
                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{evaluation.node_count}</span>
                        {activeTab === 'nodes' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('interactions')}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'interactions' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Interactions
                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{evaluation.edge_count}</span>
                        {activeTab === 'interactions' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('workflows')}
                        className={`pb-4 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === 'workflows' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Workflows
                        <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">{evaluation.path_count}</span>
                        {activeTab === 'workflows' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-24">
                    {activeTab === 'nodes' && (
                        <>
                            {evaluation.node_evaluations?.map((node, index) => (
                                <div key={node.id} className="relative">
                                    {/* Top: Metadata */}
                                    <div className="mb-6">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="px-3 py-1 bg-gray-900 text-white text-xs font-bold rounded-full">PAGE {index + 1}</span>
                                            <h3 className="text-lg font-bold text-gray-800 truncate">{node.url}</h3>
                                        </div>
                                        <p className="text-gray-400 text-xs font-mono">Node ID: {node.node_id}</p>
                                    </div>

                                    <div className="flex gap-8">
                                        {/* Left: Visual & Scores */}
                                        <div className="w-[65%] flex flex-col gap-6 shrink-0">
                                            <div className="group relative aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-lg transition-transform hover:scale-[1.02] duration-500">
                                                <img
                                                    src={`${backendUrl}/api/nodes/${node.node_id}/screenshot`}
                                                    alt={`Screenshot of ${node.url}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22450%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20450%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_194ae095efb%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3Avar(--font-geist-sans)%2C%20monospace%3Bfont-size%3A40pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f3f4f6%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%3ENo%20Screenshot%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fsvg%3E'
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                                            </div>

                                            {/* Local Scores - moved below image */}
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { l: 'Learnability', s: node.learnability_score },
                                                    { l: 'Control', s: node.control_score },
                                                ].map((item) => (
                                                    <div key={item.l} className="text-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">{item.l}</div>
                                                        <div className={`text-xl font-bold ${getScoreColor(item.s)}`}>{item.s.toFixed(0)}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right: Heuristic Checklist */}
                                        <div className="w-[35%]">
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Heuristic Checklist</h4>
                                                </div>
                                                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                                                    {[...node.learnability_items, ...node.control_items].map((item, idx) => (
                                                        <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                                <div>
                                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">&lt;{item.element.tag}&gt;</span>
                                                                    <p className="text-sm font-semibold text-gray-800">{item.element.text || '(No text)'}</p>
                                                                </div>
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-[10px] font-mono text-gray-400">{item.element.class}</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {item.checks.map((check, cidx) => (
                                                                    <div key={cidx} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${check.status === 'PASS' ? 'bg-green-50/50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                                        <svg className={`w-4 h-4 mt-0.5 shrink-0 ${check.status === 'PASS' ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            {check.status === 'PASS' ? (
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                            ) : (
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                            )}
                                                                        </svg>
                                                                        <div>
                                                                            <span className="font-bold mr-2">{check.name}</span>
                                                                            <span className="opacity-80">{check.message}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {index < (evaluation.node_evaluations?.length || 0) - 1 && (
                                        <div className="absolute -bottom-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                                    )}
                                </div>
                            ))}
                        </>
                    )}

                    {activeTab === 'interactions' && (
                        <div className="space-y-12">
                            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-4">Interaction Analysis (Grouped by Source Node)</h2>
                            {evaluation.edge_evaluations?.length === 0 && (
                                <p className="text-gray-500 italic">No interaction data available.</p>
                            )}

                            {/* Group Edges by Source Node */}
                            {Object.entries(
                                (evaluation.edge_evaluations || []).reduce((acc, edge) => {
                                    const sourceId = edge.from_node_id || 'unknown'
                                    if (!acc[sourceId]) acc[sourceId] = []
                                    acc[sourceId].push(edge)
                                    return acc
                                }, {} as Record<string, EdgeEvaluation[]>)
                            ).map(([sourceId, edges]) => {
                                // Find Source Node Info
                                const sourceNode = evaluation.node_evaluations?.find(n => n.node_id === sourceId)

                                return (
                                    <div key={sourceId} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                        {/* Source Node Header */}
                                        <div className="bg-gray-50 p-6 border-b border-gray-200">
                                            <div className="flex gap-8">
                                                {/* Left: Source Image */}
                                                <div className="w-[65%] shrink-0">
                                                    <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden border border-gray-300 mb-4">
                                                        <img
                                                            src={sourceId !== 'unknown' ? `${backendUrl}/api/nodes/${sourceId}/screenshot` : ''}
                                                            alt="Source Node"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22450%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20450%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e5e7eb%22%3E%3C%2Frect%3E%3C%2Fsvg%3E'
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 block">FROM</span>
                                                            <h3 className="text-lg font-bold text-gray-900 truncate max-w-md">{sourceNode?.url || 'Unknown Source'}</h3>
                                                            <p className="text-xs font-mono text-gray-400 mt-1">{sourceId}</p>
                                                        </div>
                                                        <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-right">
                                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Page Efficiency</div>
                                                            <div className={`text-2xl font-black ${getScoreColor(
                                                                edges.reduce((sum, e) => sum + (e.result?.efficiency?.score || 0), 0) / edges.length
                                                            )}`}>
                                                                {(edges.reduce((sum, e) => sum + (e.result?.efficiency?.score || 0), 0) / edges.length).toFixed(1)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Heuristic Checklist (Interaction List) */}
                                                <div className="w-[35%] flex flex-col justify-center">
                                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Interactions & Checks</h4>
                                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">

                                                        {/* List of Edges from this Source */}
                                                        <div className="p-6 space-y-4">
                                                            {edges.map((edge) => (
                                                                <div key={edge.edge_id} className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-200 before:rounded-full">
                                                                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-blue-100">Action</span>
                                                                                <span className="font-bold text-gray-800 break-all text-sm">{edge.action}</span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex gap-2 shrink-0">
                                                                            {[
                                                                                { l: 'E', s: edge.result?.efficiency?.score || 0 },
                                                                            ].map((item) => (
                                                                                <div key={item.l} className="flex items-center gap-1 bg-gray-50 rounded px-2 py-1 border border-gray-100">
                                                                                    <span className="text-[10px] text-gray-500 font-bold uppercase">{item.l}</span>
                                                                                    <span className={`text-sm font-bold ${getScoreColor(item.s)}`}>{item.s.toFixed(0)}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>

                                                                    {/* Warning/Error Highlights Only */}
                                                                    <div className="space-y-2">
                                                                        {edge.result?.efficiency?.latency && edge.result.efficiency.latency.status === 'Slow' && (
                                                                            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">
                                                                                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                                                <span className="font-bold">Slow Response ({edge.result.efficiency.latency.duration_ms}ms)</span>
                                                                                <span className="text-red-500 truncate">{edge.result.efficiency.latency.description}</span>
                                                                            </div>
                                                                        )}
                                                                        {[...(edge.result?.efficiency?.failed || [])].map((check, i) => (
                                                                            <div key={i} className="flex items-start gap-2 text-xs text-red-600 bg-red-50/50 p-1.5 rounded">
                                                                                <svg className="w-3 h-3 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                                <span className="font-semibold shrink-0">{check.check}:</span>
                                                                                <span className="truncate">{check.message}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {activeTab === 'workflows' && (
                        <div className="space-y-8">
                            <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-4">Workflow Analysis (Paths)</h2>
                            {evaluation.workflow_evaluations?.length === 0 && (
                                <p className="text-gray-500 italic">No workflow data available.</p>
                            )}
                            <div className="grid gap-6">
                                {evaluation.workflow_evaluations?.map((wf) => (
                                    <div key={wf.path_index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Path {wf.path_index}</span>
                                                    <h3 className="text-lg font-bold text-gray-800 break-all font-mono">{wf.path_summary}</h3>
                                                </div>
                                            </div>

                                            {/* Scores */}
                                            <div className="flex gap-3">
                                                {[
                                                    { l: 'Eff', s: wf.result?.efficiency?.score || 0 },
                                                ].map((item) => (
                                                    <div key={item.l} className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-2 w-16">
                                                        <span className="text-[10px] text-gray-500 font-bold uppercase">{item.l}</span>
                                                        <span className={`text-lg font-bold ${getScoreColor(item.s)}`}>{item.s.toFixed(0)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-8 overflow-x-auto scrollbar-hide pb-4">
                                            <div className="flex items-center gap-4 min-w-max px-2">
                                                {wf.path_summary.split(' -> ').map((nodeId: string, idx: number, arr: string[]) => {
                                                    let node = evaluation.node_evaluations?.find(n => n.node_id === nodeId)
                                                    let displayId = nodeId

                                                    // Fallback if node not found
                                                    if (!node && evaluation.node_evaluations && evaluation.node_evaluations.length > 0) {
                                                        const fallbackNode = evaluation.node_evaluations[idx % evaluation.node_evaluations.length]
                                                        displayId = fallbackNode.node_id // Use fallback ID for image
                                                        // We keep the original 'node' as undefined if we want to show original ID, 
                                                        // or we could point 'node' to fallbackNode if we want to show fallback URL in tooltip etc.
                                                    }

                                                    return (
                                                        <div key={idx} className="flex items-center gap-4">
                                                            <div className="relative group shrink-0">
                                                                <div className="w-48 aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm group-hover:shadow-md transition-all group-hover:scale-105 duration-300">
                                                                    <img
                                                                        src={`${backendUrl}/api/nodes/${displayId}/screenshot`}
                                                                        alt={`Step ${idx + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => {
                                                                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22450%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20450%22%20preserveAspectRatio%3D%22none%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23e5e7eb%22%3E%3C%2Frect%3E%3C%2Fsvg%3E'
                                                                        }}
                                                                    />
                                                                </div>
                                                                <div className="mt-2 text-center">
                                                                    <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">Step {idx + 1}</span>
                                                                    <p className="text-[10px] font-mono text-gray-400 truncate w-48">{nodeId}</p>
                                                                </div>
                                                            </div>

                                                            {idx < arr.length - 1 && (
                                                                <div className="text-gray-300 shrink-0">
                                                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* KLM Breakdown */}
                                        {wf.result?.efficiency?.interaction_efficiency && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-bold text-gray-700 mb-2">KLM Efficiency Breakdown</h4>
                                                <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                                                    <table className="w-full text-left">
                                                        <thead>
                                                            <tr className="border-b border-gray-200 text-gray-500">
                                                                <th className="pb-2">Step</th>
                                                                <th className="pb-2">Action</th>
                                                                <th className="pb-2">Operators</th>
                                                                <th className="pb-2 text-right">Est. Time</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {wf.result.efficiency.interaction_efficiency.klm_breakdown?.map((step: any, i: number) => (
                                                                <tr key={i} className="border-b border-gray-100 last:border-0">
                                                                    <td className="py-2">{step.step}</td>
                                                                    <td className="py-2 text-blue-600 font-semibold">{step.action}</td>
                                                                    <td className="py-2 text-gray-500">
                                                                        {step.ops.map((op: string, j: number) => (
                                                                            <span key={j} className="inline-block bg-gray-200 rounded px-1 min-w-[20px] text-center mr-1 text-[10px]">{op}</span>
                                                                        ))}
                                                                    </td>
                                                                    <td className="py-2 text-right font-bold">{step.est_time}s</td>
                                                                </tr>
                                                            ))}
                                                            <tr className="bg-gray-100">
                                                                <td colSpan={3} className="py-2 pl-2 font-bold text-gray-800">Total Estimated Time</td>
                                                                <td className="py-2 pr-2 text-right font-bold text-gray-900">{wf.result.efficiency.interaction_efficiency.total_estimated_time_s}s</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {/* Fitts's Law Issues */}
                                        {wf.result?.efficiency?.target_size_spacing?.fitts_issues && wf.result.efficiency.target_size_spacing.fitts_issues.length > 0 && (
                                            <div className="mb-6">
                                                <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                    Fitts's Law & Size Issues
                                                </h4>
                                                <div className="space-y-2">
                                                    {wf.result.efficiency.target_size_spacing.fitts_issues.map((issue: any, i: number) => (
                                                        <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm">
                                                            <div className="flex justify-between mb-1">
                                                                <span className="font-bold text-red-800">Step {issue.step}</span>
                                                                <span className="text-red-600 text-xs font-mono">ID: {issue.ID}</span>
                                                            </div>
                                                            <p className="text-gray-800 font-medium mb-1">{issue.target}</p>
                                                            <p className="text-gray-600 text-xs">{issue.message}</p>
                                                            <div className="mt-2 flex gap-4 text-xs text-gray-500 font-mono">
                                                                <span>Dist: {issue.distance}px</span>
                                                                <span>Width: {issue.width}px</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Passed Checks */}
                                        <div className="space-y-1 mt-4 border-t pt-4">
                                            {(wf.result?.efficiency?.passed || []).map((check: any, i: number) => (
                                                <div key={i} className="flex items-start gap-2 text-sm text-green-700">
                                                    <svg className="w-4 h-4 mt-0.5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                    <span>{check.message}</span>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
