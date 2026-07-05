import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utcPlugin from 'dayjs/plugin/utc'
import { cacheLife } from 'next/cache'
import { Game, Server } from '~/types'

dayjs.extend(customParseFormat)
dayjs.extend(utcPlugin)

const logfileUrl = 'https://dcf-data.dungeoncrawlforks.org/meta/crawl-dcchili/logfile'
const versionRegExp = /\d+\.\d+/
const splitRegExp = /(?:[^:]|::)+/g
const keyValueRegExp = /(?:[^=])+/g

const dcfServer: Server = {
  id: 'dcf-data',
  name: 'Dungeon Crawl Fajita',
  abbreviation: 'DCF',
  url: 'https://dcf.dungeoncrawlforks.org',
  baseUrl: 'https://dcf-data.dungeoncrawlforks.org',
  morgueUrl: 'https://dcf-data.dungeoncrawlforks.org/morgue',
}

export type TopPlayers = {
  gamesTotal: number
  winsTotal: number
  minGamesThresholdForWinrate: number
  byWins: Array<{ name: string; wins: number }>
  byWinrate: Array<{ name: string; winrate: number; games: number }>
  byTitles: Array<{ name: string; titles: number }>
}

type HighscoreKind = 'HIGHSCORE' | 'TURN_COUNT' | 'DURATION'
type RuneTier = 'ALL' | 'TIER_1' | 'TIER_2'

type RawGame = Record<string, string>

const requiredKeys = [
  'name',
  'ktyp',
  'start',
  'end',
  'v',
  'race',
  'cls',
  'char',
  'xl',
  'sc',
  'turn',
  'title',
  'tmsg',
  'dur',
  'br',
  'lvl',
  'str',
  'int',
  'dex',
]

const parseLine = (line: string): RawGame | null => {
  const chunks = Array.from(line.trim().match(splitRegExp) ?? [])
  const parsed = chunks.reduce((acc, chunk) => {
    const [key, value] = chunk.match(keyValueRegExp) || []
    if (key && value) {
      acc[key] = value.replace('::', ':')
    }
    return acc
  }, {} as RawGame)

  return requiredKeys.every((key) => parsed[key]) ? parsed : null
}

const createDateFromLogfileDate = (value: string) => {
  const [, year, month, rest] = value.match(/(\d{4})(\d{2})(\d{8}).*/) || []
  return dayjs(`${year}${String(Number(month) + 1).padStart(2, '0')}${rest}`, 'YYYYMMDDHHmmss')
    .utc(true)
    .toISOString()
}

const getVersionIntegerFromString = (versionShort: string) => {
  const [major, minor] = versionShort.split('.').map(Number)
  return (major || 0) * 1000 + (minor || 0)
}

const getGameFromRaw = (raw: RawGame, index: number): Game => {
  const versionShort = raw.v.match(versionRegExp)?.[0] ?? raw.v
  const raceAbbr = raw.char.slice(0, 2)
  const classAbbr = raw.char.slice(2, 4)

  return {
    id: `dcf-${index}`,
    isWin: raw.ktyp === 'winning',
    startAt: createDateFromLogfileDate(raw.start),
    endAt: createDateFromLogfileDate(raw.end),
    playerId: raw.name.toLowerCase(),
    version: raw.v,
    versionShort,
    versionInteger: getVersionIntegerFromString(versionShort),
    score: Number(raw.sc),
    xl: Number(raw.xl),
    race: raw.race,
    class: raw.cls,
    normalizedRace: raw.race,
    normalizedClass: raw.cls,
    raceAbbr,
    classAbbr,
    char: raw.char,
    title: raw.title,
    god: raw.god ?? null,
    piety: raw.piety ? Number(raw.piety) : null,
    endMessage: raw.tmsg,
    logfileId: 'dcf-logfile',
    turns: Number(raw.turn),
    duration: Number(raw.dur),
    branch: raw.br,
    lvl: Number(raw.lvl),
    runes: Number(raw.nrune ?? raw.urune ?? 0),
    uniqueRunes: Number(raw.urune ?? raw.nrune ?? 0),
    gems: Number(raw.fgem ?? 0),
    fifteenskills: raw.fifteenskills ? raw.fifteenskills.split(',') : [],
    maxskills: raw.maxskills ? raw.maxskills.split(',') : [],
    name: raw.name,
    str: Number(raw.str),
    int: Number(raw.int),
    dex: Number(raw.dex),
    ac: raw.ac ? Number(raw.ac) : undefined,
    ev: raw.ev ? Number(raw.ev) : undefined,
    sh: raw.sh ? Number(raw.sh) : undefined,
    server: dcfServer,
  }
}

export const getDcfGames = async () => {
  'use cache'
  cacheLife('minutes')

  const response = await fetch(logfileUrl, { next: { revalidate: 300 } })
  if (!response.ok) {
    throw new Error(`Failed to fetch DCF logfile: ${response.status}`)
  }

  return (await response.text())
    .split('\n')
    .map(parseLine)
    .map((raw, index) => (raw ? getGameFromRaw(raw, index) : null))
    .filter((game): game is Game => Boolean(game))
}

const sortDesc = <T>(items: T[], getter: (item: T) => number) =>
  items.sort((a, b) => getter(b) - getter(a))

const sortAsc = <T>(items: T[], getter: (item: T) => number) =>
  items.sort((a, b) => getter(a) - getter(b))

export const getDcfTopStats = async ({
  since,
  minGamesThresholdForWinrate,
}: {
  since?: Date
  minGamesThresholdForWinrate: number
}): Promise<TopPlayers> => {
  const games = (await getDcfGames()).filter((game) =>
    since ? new Date(game.endAt) >= since : true,
  )
  const playerStats = new Map<string, { name: string; games: number; wins: number; titles: Set<string> }>()

  for (const game of games) {
    const current = playerStats.get(game.playerId) ?? {
      name: game.name,
      games: 0,
      wins: 0,
      titles: new Set<string>(),
    }

    current.games += 1
    if (game.isWin) {
      current.wins += 1
      current.titles.add(game.title)
    }
    playerStats.set(game.playerId, current)
  }

  const stats = Array.from(playerStats.values())
  const winsTotal = games.filter((game) => game.isWin).length

  return {
    gamesTotal: games.length,
    winsTotal,
    minGamesThresholdForWinrate,
    byWins: sortDesc(
      stats.filter((item) => item.wins > 0),
      (item) => item.wins,
    )
      .slice(0, 10)
      .map((item) => ({ name: item.name, wins: item.wins })),
    byWinrate: sortDesc(
      stats.filter((item) => item.games >= minGamesThresholdForWinrate),
      (item) => item.wins / item.games,
    )
      .slice(0, 10)
      .map((item) => ({ name: item.name, winrate: item.wins / item.games, games: item.games })),
    byTitles: sortDesc(
      stats.filter((item) => item.titles.size > 0),
      (item) => item.titles.size,
    )
      .slice(0, 10)
      .map((item) => ({ name: item.name, titles: item.titles.size })),
  }
}

const isRuneTierMatch = (game: Game, kind: HighscoreKind, runeTier: RuneTier) => {
  if (runeTier === 'ALL') {
    return true
  }

  if (kind === 'HIGHSCORE') {
    return runeTier === 'TIER_1' ? game.runes === 3 : game.runes >= 4
  }

  return runeTier === 'TIER_1' ? game.runes >= 3 && game.runes <= 14 : game.runes === 15
}

export const getDcfRecentWins = async () =>
  sortDesc(
    (await getDcfGames()).filter((game) => game.isWin),
    (game) => new Date(game.endAt).getTime(),
  ).slice(0, 10)

export const getDcfHighscores = async ({
  kind,
  runeTier,
}: {
  kind: HighscoreKind
  runeTier: RuneTier
}) => {
  const wins = (await getDcfGames()).filter(
    (game) => game.isWin && isRuneTierMatch(game, kind, runeTier),
  )

  const byChar = wins.reduce((acc, game) => {
    const games = acc.get(game.char) ?? []
    games.push(game)
    acc.set(game.char, games)
    return acc
  }, new Map<string, Game[]>())
  const records = Array.from(byChar.values()).flatMap((games) => {
    const sorted =
      kind === 'DURATION'
        ? sortAsc(games, (game) => game.duration)
        : kind === 'TURN_COUNT'
          ? sortAsc(games, (game) => game.turns)
          : sortDesc(games, (game) => game.score)

    return sorted.slice(0, 10)
  })

  const sorted =
    kind === 'DURATION'
      ? sortAsc(records, (game) => game.duration)
      : kind === 'TURN_COUNT'
        ? sortAsc(records, (game) => game.turns)
        : sortDesc(records, (game) => game.score)

  return sorted.slice(0, 10)
}
