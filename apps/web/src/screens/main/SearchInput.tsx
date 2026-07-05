'use client'

import { Autocomplete } from '@base-ui/react/autocomplete'
import { escapeRegExp, orderBy, startsWith } from 'lodash-es'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'

type SearchItem = { name: string }

export const SearchInput = ({ nickname, playerNames }: { nickname: string; playerNames: string[] }) => {
  const [query, setQuery] = useState('')

  const router = useRouter()
  const target = query.trim().toLowerCase()
  const items = useMemo(() => {
    if (!target) {
      return []
    }

    const matches = playerNames
      .filter((name) => name.toLowerCase().includes(target))
      .slice(0, 20)
      .map((name) => ({ name }))

    return orderBy(matches, (item) => startsWith(item.name.toLowerCase(), target), 'desc')
  }, [playerNames, target])

  const goToPlayerPage = useCallback((slug: string) => {
    router.push(`/players/${slug}`)
  }, [])

  const highlightedRef = useRef<SearchItem | null>(null)

  return (
    <Autocomplete.Root
      mode="none"
      autoHighlight={false}
      openOnInputClick={false}
      items={items}
      value={query}
      itemToStringValue={(item: SearchItem) => item.name}
      onValueChange={setQuery}
      onItemHighlighted={(item) => {
        highlightedRef.current = item ?? null
      }}
    >
      <Autocomplete.InputGroup className="flex">
        <Autocomplete.Input
          placeholder={`Search DCF player by nickname, e.g. "${nickname}"`}
          className="block h-10 w-full rounded-l-sm border border-gray-400 px-2 text-ellipsis"
          onFocus={(e) => {
            e.currentTarget.select()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !highlightedRef.current && query) {
              e.preventDefault()
              goToPlayerPage(query)
            }
          }}
        />
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-r-sm border border-l-0 border-gray-400 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-700 dark:hover:bg-zinc-600"
          onClick={() => query && goToPlayerPage(query)}
        >
          <Image
            src="/i-identify.png"
            alt="Search"
            width={32}
            height={32}
            className="pixelated pointer-events-none relative -top-[7px] -left-2"
          />
        </button>
      </Autocomplete.InputGroup>

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={4} className="z-20">
          <Autocomplete.Popup className="w-(--anchor-width) rounded-md border border-gray-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            {!target && (
              <Autocomplete.Status className="px-3 py-2 text-sm text-gray-500 dark:text-zinc-400">
                Type to search DCF players
              </Autocomplete.Status>
            )}
            {target && items.length === 0 && (
              <Autocomplete.Empty className="px-3 py-2 text-sm text-gray-500 dark:text-zinc-400">
                Nothing found
              </Autocomplete.Empty>
            )}
            {items.length > 0 && (
              <Autocomplete.List className="max-h-64 overflow-y-auto p-1">
                {(item: SearchItem) => (
                  <Autocomplete.Item
                    key={item.name}
                    value={item}
                    className="cursor-default rounded-sm px-3 py-1.5 text-sm data-highlighted:bg-gray-100 dark:data-highlighted:bg-zinc-700"
                    onClick={() => {
                      goToPlayerPage(item.name)
                    }}
                  >
                    <Highlighted text={item.name} query={target} />
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            )}
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  )
}

export const Highlighted = ({ text, query }: { text: string; query: string }) => {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return <span>{text}</span>
  }

  const regex = new RegExp(`(${escapeRegExp(trimmedQuery)})`, 'gi')
  const parts = text.split(regex)

  return (
    <span>
      {parts
        .filter(Boolean)
        .map((part, i) => (regex.test(part) ? <b key={i}>{part}</b> : <span key={i}>{part}</span>))}
    </span>
  )
}
