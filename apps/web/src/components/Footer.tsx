import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { cn } from '~/utils'

export const Footer = ({ className }: { className?: string }) => (
  <footer
    className={cn('grid justify-between gap-1 text-xs text-gray-400 md:grid-cols-2', className)}
  >
    <div>
      Player and game statistics for{' '}
      <a
        href="https://dungeoncrawlchili.org/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        Dungeon Crawl Chili
      </a>
    </div>

    <div className="grid grid-cols-2 gap-1 md:flex md:justify-end md:gap-4">
      <Link prefetch={false} href="/servers" className="hover:underline">
        Tracked servers
      </Link>

      <Link prefetch={false} href="/community" className="hover:underline">
        Community links
      </Link>

      <Link prefetch={false} href="https://patreon.com/rogga" className="hover:underline">
        Support RoGGa on Patreon
      </Link>

      <a
        href="https://github.com/O4epegb/dcss-stats"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 hover:underline"
      >
        Github
        <ArrowTopRightOnSquareIcon className="size-4" />
      </a>
    </div>

    <div>
      Maintained by <span className="font-semibold text-gray-500">RoGGa</span>. Email{' '}
      <a href="mailto:rogga@crawlcosplay.org" className="underline">
        rogga@crawlcosplay.org
      </a>{' '}
      with bugs and suggestions
    </div>
  </footer>
)
