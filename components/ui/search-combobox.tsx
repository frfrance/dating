'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type Option = {
  value: string
  label: string
}

type SearchComboboxProps = {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder: string
  searchPlaceholder: string
  emptyText: string
  disabled?: boolean
}

const MAX_VISIBLE_OPTIONS = 20

export function SearchCombobox({
  value,
  onChange,
  options,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled = false,
}: SearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const selected = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  const filteredOptions = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    // Chưa gõ gì thì không hiện gì cả
    if (!normalizedQuery) {
      return []
    }

    return options
      .filter((option) => option.label.toLowerCase().includes(normalizedQuery))
      .slice(0, MAX_VISIBLE_OPTIONS)
  }, [options, query])

  function handleSelect(nextValue: string) {
    onChange(nextValue)
    setOpen(false)
    setQuery('')
  }

  const showStartTypingHint = query.trim().length === 0

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setQuery('')
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-12 w-full justify-between rounded-2xl border border-gray-300 bg-white px-4 text-left text-black shadow-sm hover:bg-white',
            disabled && 'opacity-60'
          )}
        >
          <span className="truncate text-black">
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-gray-500" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] rounded-2xl border border-gray-200 bg-white p-0 shadow-xl"
      >
        <div className="border-b border-gray-200 p-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-black outline-none placeholder:text-gray-400"
          />
        </div>

        <div className="max-h-72 overflow-y-auto p-1">
          {showStartTypingHint ? (
            <div className="px-3 py-3 text-sm text-gray-500">
              Hãy nhập để bắt đầu tìm kiếm.
            </div>
          ) : filteredOptions.length === 0 ? (
            <div className="px-3 py-3 text-sm text-gray-500">
              {emptyText}
            </div>
          ) : (
            filteredOptions.map((option) => {
              const active = value === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm text-black hover:bg-pink-50"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4 text-pink-500',
                      active ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                </button>
              )
            })
          )}
        </div>

        {!showStartTypingHint && options.length > MAX_VISIBLE_OPTIONS ? (
          <div className="border-t border-gray-100 px-3 py-2 text-xs text-gray-400">
            Hiển thị tối đa {MAX_VISIBLE_OPTIONS} kết quả. Hãy gõ cụ thể hơn nếu cần.
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}