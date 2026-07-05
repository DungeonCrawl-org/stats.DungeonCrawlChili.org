import Image from 'next/image'
import Link from 'next/link'

export const Logo = () => {
  return (
    <Link className="inline-flex items-center space-x-2" href="/">
      <Image
        priority
        alt="Dungeon Crawl Chili Stats app logo"
        width="128"
        height="128"
        src="/logo.png"
        className="pixelated size-8"
        quality={100}
      />
      <h1 className="text-center text-xl leading-tight sm:text-3xl">Dungeon Crawl Chili Stats</h1>
    </Link>
  )
}
