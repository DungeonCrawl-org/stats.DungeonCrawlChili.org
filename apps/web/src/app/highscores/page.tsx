import { Metadata } from 'next'
import Link from 'next/link'
import { sharedOGMetadata } from '~/app/shared-metadata'
import { defaultMetaTitle } from '~/constants'
import { getDcfHighscores } from '~/screens/main/dcfData'
import { Table } from '~/screens/main/Table'
import { cn } from '~/utils'

const title = `Highscores | ${defaultMetaTitle}`

export const metadata: Metadata = {
  title,
  openGraph: {
    ...sharedOGMetadata,
    title,
  },
}

type SearchParams = {
  [key: string]: string | string[] | undefined
}

const kinds = [
  { value: 'HIGHSCORE' as const, label: 'Score', highlight: 'Score' },
  { value: 'TURN_COUNT' as const, label: 'Turncount', highlight: 'Turns' },
  { value: 'DURATION' as const, label: 'Speedrun', highlight: 'Duration' },
]

const runeTiers = [
  { value: 'ALL' as const, label: 'All runes' },
  { value: 'TIER_1' as const, label: '3 runes' },
  { value: 'TIER_2' as const, label: '4+ runes / 15-rune speed' },
]

export default async function HighscoresPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const kind = kinds.find((item) => item.value === params.kind)?.value ?? 'HIGHSCORE'
  const runeTier = runeTiers.find((item) => item.value === params.runeTier)?.value ?? 'ALL'
  const kindConfig = kinds.find((item) => item.value === kind) ?? kinds[0]
  const games = await getDcfHighscores({ kind, runeTier })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {kinds.map((item) => (
            <Link
              key={item.value}
              prefetch={false}
              href={{ pathname: '/highscores', query: { kind: item.value, runeTier } }}
              className={cn(
                'rounded px-2 py-0.5 text-sm',
                kind === item.value
                  ? 'bg-gray-200 font-medium dark:bg-gray-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <span className="text-gray-300 dark:text-gray-600">|</span>
        <div className="flex gap-1">
          {runeTiers.map((item) => (
            <Link
              key={item.value}
              prefetch={false}
              href={{ pathname: '/highscores', query: { kind, runeTier: item.value } }}
              className={cn(
                'rounded px-2 py-0.5 text-sm',
                runeTier === item.value
                  ? 'bg-gray-200 font-medium dark:bg-gray-700'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800',
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing only games from{' '}
        <a
          href="https://dcf-data.dungeoncrawlforks.org/meta/crawl-dcchili/logfile"
          className="underline"
        >
          dcf-data.dungeoncrawlforks.org
        </a>
        .
      </p>

      {games.length > 0 ? (
        <Table games={games} title="DCF highscores" highlight={kindConfig.highlight} />
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-gray-500 dark:text-gray-400">
          <span className="text-xl">¯\_(ツ)_/¯</span>
          <div>No DCF wins found yet.</div>
        </div>
      )}
    </div>
  )
}
