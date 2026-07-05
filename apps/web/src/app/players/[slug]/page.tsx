import dayjs from "dayjs"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Footer } from "~/components/Footer"
import { HeaderWithMenu } from "~/components/HeaderWithMenu"
import { defaultMetaDescription, defaultMetaTitle } from "~/constants"
import { getDcfGames } from "~/screens/main/dcfData"
import { formatDuration, formatNumber, getMorgueUrl } from "~/utils"

async function getPlayerGames(slug: string) {
  const games = (await getDcfGames()).filter(
    (game) => game.name.toLowerCase() === slug.toLowerCase(),
  )

  if (!games.length) {
    notFound()
  }

  const playerName = games[0].name
  if (playerName !== slug) {
    redirect("/players/" + playerName)
  }

  return games.sort((a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime())
}

export default async function Page(props: PageProps<"/players/[slug]">) {
  const { slug } = await props.params
  const games = await getPlayerGames(slug)
  const wins = games.filter((game) => game.isWin)
  const totalScore = games.reduce((sum, game) => sum + game.score, 0)
  const totalRunes = games.reduce((sum, game) => sum + game.runes, 0)
  const totalDuration = games.reduce((sum, game) => sum + game.duration, 0)
  const bestScore = Math.max(...games.map((game) => game.score))
  const bestXl = Math.max(...games.map((game) => game.xl))
  const recentGames = games.slice(0, 25)

  return (
    <div className="container mx-auto flex min-h-dvh flex-col px-4">
      <div className="w-full max-w-5xl space-y-4 py-4">
        <HeaderWithMenu />

        <main className="space-y-4">
          <section className="space-y-2">
            <div>
              <h2 className="text-3xl font-bold">{games[0].name}</h2>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Source:{" "}
                <a
                  className="underline"
                  href="https://dcf-data.dungeoncrawlforks.org/meta/crawl-dcchili/logfile"
                >
                  dcf-data.dungeoncrawlforks.org
                </a>
              </div>
            </div>

            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Wins" value={formatNumber(wins.length)} />
              <Stat label="Games" value={formatNumber(games.length)} />
              <Stat
                label="Win Rate"
                value={formatNumber((wins.length / games.length) * 100, {
                  maximumFractionDigits: 2,
                }) + "%"}
              />
              <Stat label="Best XL" value={formatNumber(bestXl)} />
              <Stat label="Total Score" value={formatNumber(totalScore)} />
              <Stat label="Best Score" value={formatNumber(bestScore)} />
              <Stat label="Runes" value={formatNumber(totalRunes)} />
              <Stat label="Time Played" value={formatDuration(totalDuration)} />
            </div>
          </section>

          <section className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="pb-1 text-left font-semibold">Recent DCF games:</caption>
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-700">
                  <th className="py-1 pr-2">Date</th>
                  <th className="px-2">Result</th>
                  <th className="px-2">Char</th>
                  <th className="px-2">XL</th>
                  <th className="px-2">Score</th>
                  <th className="px-2">Turns</th>
                  <th className="px-2">Duration</th>
                  <th className="px-2">Version</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.map((game) => (
                  <tr
                    key={game.id}
                    className="border-b border-gray-100 odd:bg-gray-50 dark:border-zinc-800 dark:odd:bg-zinc-900"
                  >
                    <td className="py-1 pr-2 whitespace-nowrap">
                      <a className="hover:underline" href={getMorgueUrl(game.server!.morgueUrl, game)}>
                        {dayjs(game.endAt).format("DD MMM YYYY")}
                      </a>
                    </td>
                    <td className="px-2 whitespace-nowrap">
                      {game.isWin ? "Win" : game.endMessage}
                    </td>
                    <td className="px-2 whitespace-nowrap">{game.char}</td>
                    <td className="px-2 tabular-nums">{game.xl}</td>
                    <td className="px-2 tabular-nums">{formatNumber(game.score)}</td>
                    <td className="px-2 tabular-nums">{formatNumber(game.turns)}</td>
                    <td className="px-2 tabular-nums">{formatDuration(game.duration)}</td>
                    <td className="px-2 whitespace-nowrap">{game.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  )
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded border border-gray-200 p-2 dark:border-zinc-700">
    <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
)

export async function generateMetadata({
  params,
}: PageProps<"/players/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const games = (await getDcfGames()).filter(
    (game) => game.name.toLowerCase() === slug.toLowerCase(),
  )

  if (!games.length) {
    return {
      title: "Player not found | " + defaultMetaTitle,
    }
  }

  const playerName = games[0].name
  const wins = games.filter((game) => game.isWin).length
  const winrate = formatNumber((wins / games.length) * 100, { maximumFractionDigits: 2 })
  const title = playerName + " | " + defaultMetaTitle
  const description =
    playerName +
    " DCF stats - " +
    wins +
    "W " +
    games.length +
    "G " +
    winrate +
    "% WR | " +
    defaultMetaDescription

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}
