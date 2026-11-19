import Image from 'next/image'
import { siteConfig } from '@/lib/site-config'
import { SectionHeading } from './primitives'

export function PrizesSection() {
  return (
    <section id="prizes" className="scroll-mt-16 border-y-[3px] border-ink bg-comic-yellow">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="flex flex-col items-start gap-6">
          <SectionHeading kicker="Glory awaits!" title="The moment of" accent="glory!" />
          <p
            data-reveal="left"
            style={{ ['--reveal-delay' as string]: '250ms' }}
            className="comic-shadow -rotate-1 border-[3px] border-ink bg-paper px-5 py-3 font-display text-3xl tracking-wide sm:text-4xl"
          >
            {siteConfig.prizes ?? 'PRIZE DETAILS TO BE ANNOUNCED'}
          </p>
          <p data-reveal="up" style={{ ['--reveal-delay' as string]: '350ms' }} className="max-w-md text-lg leading-relaxed">
          </p>
        </div>
        <div data-reveal="pop" className="relative mx-auto w-full max-w-md">
          <div data-parallax="0.05">
          <Image
            src="/images/trophy.png"
            alt="Golden trophy bursting out of a comic explosion"
            width={1024}
            height={1024}
            sizes="(max-width: 768px) 90vw, 28rem"
            className="comic-shadow-lg h-auto w-full rounded-full border-4 border-ink transition-transform duration-500 hover:rotate-3 hover:scale-[1.02]"
          />
          </div>
        </div>
      </div>
    </section>
  )
}
