'use client'

import { useState } from 'react'

export interface MemoryPresetItem {
  key: string
  value: string
}

interface MemoryPresetModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (presets: Record<string, string>) => void
  initialPresets?: Record<string, string>
}

const MAX_ITEMS = 5

export default function MemoryPresetModal({
  isOpen,
  onClose,
  onSave,
  initialPresets = {},
}: MemoryPresetModalProps) {
  const [items, setItems] = useState<MemoryPresetItem[]>(() => {
    const entries = Object.entries(initialPresets)
    return entries.length > 0
      ? entries.map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }]
  })

  if (!isOpen) return null

  const handleAddItem = () => {
    if (items.length < MAX_ITEMS) {
      setItems([...items, { key: '', value: '' }])
    }
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleKeyChange = (index: number, key: string) => {
    const newItems = [...items]
    newItems[index].key = key
    setItems(newItems)
  }

  const handleValueChange = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index].value = value
    setItems(newItems)
  }

  const handleSave = () => {
    const presets: Record<string, string> = {}
    items.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        presets[item.key.trim()] = item.value.trim()
      }
    })
    onSave(presets)
    onClose()
  }

  const handleCancel = () => {
    // 초기값으로 복원
    const entries = Object.entries(initialPresets)
    setItems(
      entries.length > 0
        ? entries.map(([key, value]) => ({ key, value }))
        : [{ key: '', value: '' }]
    )
    onClose()
  }

  const canAddMore = items.length < MAX_ITEMS
  const hasValidItems = items.some((item) => item.key.trim() && item.value.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay - 약한 흐림 처리 */}
      <div
        className="absolute inset-0 bg-white/30 backdrop-blur-[8px] animate-in fade-in"
        onClick={handleCancel}
      ></div>

      {/* Modal content - 작고 약한 흐림 */}
      <div className="relative bg-white/60 backdrop-blur-[20px] rounded-2xl shadow-[0_4px_16px_0_rgba(0,0,0,0.1),inset_0_1px_0_0_rgba(255,255,255,0.6)] p-6 w-full max-w-md mx-4 border border-gray-200/40 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-1.5">사전 설정</h2>
          <p className="text-xs text-gray-600">
            사전 설정된 ID, PW 등을 입력하면, 그 값을 바탕으로 탐색됩니다.
          </p>
        </div>

        {/* Items list */}
        <div className="space-y-2.5 mb-4 max-h-[300px] overflow-y-auto">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="키 (예: username)"
                value={item.key}
                onChange={(e) => handleKeyChange(index, e.target.value)}
                className="w-24 px-3 py-2 bg-white/80 backdrop-blur-[10px] border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400/60 text-sm text-gray-900 placeholder:text-gray-500/70 shadow-sm"
              />
              <input
                type="text"
                placeholder="값 (예: myuser@example.com)"
                value={item.value}
                onChange={(e) => handleValueChange(index, e.target.value)}
                className="flex-1 px-3 py-2 bg-white/80 backdrop-blur-[10px] border border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400/30 focus:border-gray-400/60 text-sm text-gray-900 placeholder:text-gray-500/70 shadow-sm"
              />
              {items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors flex-shrink-0"
                  aria-label="항목 삭제"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add button */}
        {canAddMore && (
          <button
            onClick={handleAddItem}
            className="w-full mb-4 px-3 py-2 bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 rounded-lg transition-colors text-xs font-medium border border-gray-300/50"
          >
            + 항목 추가 (최대 {MAX_ITEMS}개)
          </button>
        )}

        {/* Footer buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 px-3 py-2 bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!hasValidItems}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
