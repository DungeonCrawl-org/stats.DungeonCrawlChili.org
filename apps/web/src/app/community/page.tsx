import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { Metadata } from 'next'
import { sharedOGMetadata } from '~/app/shared-metadata'
import { HeaderWithMenu } from '~/components/HeaderWithMenu'
import { defaultMetaTitle } from '~/constants'

const title = `Community | ${defaultMetaTitle}`

export const metadata: Metadata = {
  title,
  openGraph: {
    ...sharedOGMetadata,
    title,
  },
}

type CommunitySection = {
  title: string
  links: {
    href: string
    label: string
    description: string
  }[]
}

const sections: CommunitySection[] = [
  {
    title: 'Dungeon Crawl Chili',
    links: [
      {
        label: 'Official Chili website',
        href: 'https://dungeoncrawlchili.org/',
        description: 'Main Dungeon Crawl Chili homepage, downloads, notes, and project updates.',
      },
      {
        label: 'Play Dungeon Crawl Chili',
        href: 'https://dcf.dungeoncrawlforks.org/',
        description: 'Webtiles server for playing Chili online through Dungeon Crawl Forks.',
      },
      {
        label: 'Dungeon Crawl Chili source code',
        href: 'https://github.com/DungeonCrawl-org/DungeonCrawlChili',
        description: 'Official Chili repository, issue tracker, and fork history.',
      },
      {
        label: 'Chili Wiki',
        href: 'https://wiki.dungeoncrawlchili.org/Chili_Wiki',
        description: 'Dungeon Crawl Chili wiki pages, notes, and community-maintained reference material.',
      },
      {
        label: 'Dungeon Crawl Chili stats data',
        href: 'https://dcf-data.dungeoncrawlforks.org/',
        description: 'Raw logfile and morgue data used by this stats site.',
      },
    ],
  },
  {
    title: 'Dungeon Crawl Forks',
    links: [
      {
        label: 'Dungeon Crawl Forks homepage',
        href: 'https://www.dungeoncrawlforks.org/',
        description: 'Hub for Crawl forks, online play, and related fork resources.',
      },
      {
        label: 'Dungeon Crawl community Discord',
        href: 'https://discord.gg/gMnE5JFcB7',
        description: 'Chat for Dungeon Crawl Chili, other forks, play, feedback, and community discussion.',
      },
      {
        label: 'Dungeon Crawl subreddit',
        href: 'https://www.reddit.com/r/dungeoncrawl/',
        description: 'Community posts and discussion for Dungeon Crawl and its forks.',
      },
    ],
  },
  {
    title: 'Events and Challenges',
    links: [
      {
        label: 'Crawl Cosplay',
        href: 'https://www.crawlcosplay.org/',
        description: 'Themed Dungeon Crawl challenge runs and community scoreboards.',
      },
      {
        label: 'Crawl Cosplay Discord',
        href: 'https://discord.gg/pW7nqC8Wu3',
        description: 'Community chat for Crawl Cosplay events and themed runs.',
      },
    ],
  },
  {
    title: 'Upstream Crawl References',
    links: [
      {
        label: 'Dungeon Crawl Stone Soup source',
        href: 'https://github.com/crawl/crawl',
        description: 'Upstream DCSS repository that Dungeon Crawl Chili is forked from.',
      },
      {
        label: 'DCSS wiki',
        href: 'http://crawl.chaosforge.org/',
        description: 'Community-maintained mechanics reference. Some details may differ in Chili.',
      },
    ],
  },
]

const CommunityPage = () => {
  return (
    <div className="container mx-auto flex min-h-screen max-w-5xl flex-col space-y-8 p-4">
      <HeaderWithMenu />

      <main className="w-full space-y-6">
        <div>
          <h2 className="text-2xl font-semibold lg:text-left">Dungeon Crawl Chili Community</h2>
          <p className="text-zinc-500 lg:text-left dark:text-zinc-400">
            Useful links for Chili, Dungeon Crawl Forks, and related community resources.
          </p>
        </div>

        <div className="space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h3 className="text-lg font-semibold">{section.title}</h3>

              <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {section.links.map((link) => (
                  <li key={link.href} className="py-2">
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start justify-between gap-3 rounded-sm py-1"
                    >
                      <div>
                        <div className="font-medium group-hover:underline">{link.label}</div>
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                          {link.description}
                        </div>
                      </div>
                      <ArrowTopRightOnSquareIcon className="mt-0.5 size-5 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}

export default CommunityPage
