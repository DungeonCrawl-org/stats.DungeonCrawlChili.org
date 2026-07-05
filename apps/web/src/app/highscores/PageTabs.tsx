import Link from 'next/link'

export const PageTabs = () => (
  <div className="flex gap-3 text-sm">
    <Link prefetch={false} href="/highscores" className="underline">
      DCF Highscores
    </Link>
  </div>
)
