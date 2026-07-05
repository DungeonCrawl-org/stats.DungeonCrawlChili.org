import type { MonsterCatalog, MonsterData } from '@dcss-stats/extractor/monsterCatalog'
import { readdir, readFile } from 'fs/promises'
import { load } from 'js-yaml'
import path from 'path'
import { cacheLife } from 'next/cache'

const crawlSourceDir =
  process.env.DUNGEON_CRAWL_CHILI_SOURCE_DIR ??
  '/home/rogga/CrawlCosplay-org/DungeonCrawlChili/crawl-ref/source'
const monsDir = path.join(crawlSourceDir, 'dat/mons')
const tileManifestPath = path.join(crawlSourceDir, 'rltiles/dc-mon.txt')

type RawMonster = {
  name?: string
  glyph?: { char?: string; colour?: string }
  flags?: string[]
  resists?: Record<string, number>
  exp?: number
  species?: string
  genus?: string
  holiness?: string | string[]
  will?: number | 'invuln'
  attacks?: Array<{
    damage?: number
    type?: string
    flavour?: string
    special?: string
  }> | null
  hd?: number
  hp_10x?: number
  ac?: number
  ev?: number
  spells?: string
  speed?: number
  has_corpse?: boolean
  shout?: string
  intelligence?: string
  habitat?: string
  uses?: string
  size?: string
  shape?: string
  tile?: string
  description?: string
}

const enumFromMonsterFile = (filename: string) =>
  `MONS_${filename.replace(/\.yaml$/, '').replaceAll('-', '_').toUpperCase()}`

const normalizeTag = (value: string) => value.replaceAll('_', ' ')

const readTilePaths = async () => {
  const manifest = await readFile(tileManifestPath, 'utf-8')
  const tilePaths = new Map<string, string>()
  let currentDir = ''

  for (const rawLine of manifest.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith('%include') || line.startsWith('%rim')) {
      continue
    }

    if (line.startsWith('%sdir ')) {
      currentDir = line.replace('%sdir ', '').trim()
      continue
    }

    const [tileName, enumName] = line.split(/\s+/)
    if (!tileName || !enumName) {
      continue
    }

    tilePaths.set(enumName, `${currentDir}/${tileName}.png`)
  }

  return tilePaths
}

const toMonsterData = (
  raw: RawMonster,
  filename: string,
  id: number,
  tilePaths: Map<string, string>,
): MonsterData => {
  const resistLevels = raw.resists ?? {}
  const resistances = Object.entries(resistLevels)
    .filter(([, level]) => level > 0)
    .map(([name, level]) => (level > 1 ? `${normalizeTag(name)} x${level}` : normalizeTag(name)))
  const vulnerabilities = Object.entries(resistLevels)
    .filter(([, level]) => level < 0)
    .map(([name]) => normalizeTag(name))
  const enumName = enumFromMonsterFile(filename)
  const spellName = raw.spells ? normalizeTag(raw.spells) : undefined

  return {
    id,
    name: raw.name ?? filename.replace(/\.yaml$/, '').replaceAll('-', ' '),
    symbol: raw.glyph?.char ?? '?',
    tile: raw.tile,
    tile_path: tilePaths.get(enumName),
    speed: {
      base: raw.speed ?? 10,
      energy_costs: {
        move: 10,
        attack: 10,
        spell: 10,
        missile: 10,
        swim: 10,
      },
      stationary: (raw.flags ?? []).includes('stationary'),
    },
    hd: raw.hd ?? null,
    hp: raw.hp_10x ? String(raw.hp_10x / 10) : '-',
    ac: raw.ac ?? null,
    ev: raw.ev ?? null,
    attacks: (raw.attacks ?? []).map((attack) => ({
      damage: { num: 1, size: attack.damage ?? 0 },
      type: normalizeTag(attack.type ?? 'hit'),
      flavour: attack.flavour ? normalizeTag(attack.flavour) : undefined,
      special: attack.special ? normalizeTag(attack.special) : undefined,
    })),
    flags: (raw.flags ?? []).map(normalizeTag),
    resistances,
    vulnerabilities,
    corpse: raw.has_corpse ?? false,
    xp: raw.exp ?? null,
    spells: spellName ? [{ name: spellName, level: 0, mana: 0 }] : [],
    spell_string: spellName,
    size: raw.size ? normalizeTag(raw.size) : '-',
    intelligence: raw.intelligence ? normalizeTag(raw.intelligence) : '-',
    defenses: [],
    species: raw.species ? normalizeTag(raw.species) : '-',
    genus: raw.genus ? normalizeTag(raw.genus) : raw.species ? normalizeTag(raw.species) : '-',
    willpower: raw.will === 'invuln' ? 5000 : raw.will ?? 0,
    spell_hd: raw.hd ?? 0,
    shapeshifter: (raw.flags ?? []).includes('shapeshifter'),
    shape: raw.shape ? normalizeTag(raw.shape) : '-',
    holiness: Array.isArray(raw.holiness)
      ? raw.holiness.map(normalizeTag).join(', ')
      : raw.holiness
        ? normalizeTag(raw.holiness)
        : '-',
    habitat: raw.habitat ? normalizeTag(raw.habitat) : '-',
    shout: raw.shout ? normalizeTag(raw.shout) : '-',
    uses: raw.uses ?? '-',
    resist_levels: resistLevels,
    description: raw.description,
  }
}

export const getChiliMonsterCatalog = async (): Promise<MonsterCatalog> => {
  'use cache'
  cacheLife('hours')

  const [files, tilePaths] = await Promise.all([readdir(monsDir), readTilePaths()])
  const yamlFiles = files.filter((file) => file.endsWith('.yaml')).sort()
  const monsters: MonsterData[] = []

  for (const filename of yamlFiles) {
    const filePath = path.join(monsDir, filename)
    const parsed = load(await readFile(filePath, 'utf-8'), { json: true }) as RawMonster | null

    if (parsed?.name) {
      monsters.push(toMonsterData(parsed, filename, monsters.length, tilePaths))
    }
  }

  return {
    monsters,
    generatedAt: new Date().toISOString(),
    listedCount: yamlFiles.length,
    processedCount: monsters.length,
    failedCount: yamlFiles.length - monsters.length,
  }
}
