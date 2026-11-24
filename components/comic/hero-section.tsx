import Image from 'next/image'
import { CalendarClock, Clock, GraduationCap, MapPin, Users } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { RegisterButton } from './register-button'
import { HyperionBadge, Starburst, SvceLogo } from './primitives'

const highlights = [
  { icon: Clock, label: '24-Hour Hackathon', className: 'bg-comic-yellow rotate-[-1deg]' },
  { icon: MapPin, label: siteConfig.venue, className: 'bg-comic-blue rotate-[1deg]' },
  { icon: GraduationCap, label: 'SVCE Students', className: 'bg-paper rotate-[1deg]' },
  { icon: Users, label: 'Team Size: 2–4 Members', className: 'bg-comic-yellow rotate-[-1deg]' },
]

export function HeroSection() {
  return (
    <section id="home" tabIndex={-1} className="halftone relative scroll-mt-16 outline-none">
      {/* SVCE banner logo strip */}
      <div className="border-b-[3px] border-ink bg-ink">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Image
            src="/images/svce-banner.png"
            alt="SVCE — Sri Venkateshwara College of Engineering, Estd. 2001, Autonomous Institute"
            width={1200}
            height={160}
            priority
            className="h-10 w-auto sm:h-12"
          />
        </div>
      </div>
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-8">
        <div data-stagger="110" className="flex flex-col items-start gap-7">
          <div data-reveal="up" className="flex flex-wrap items-center gap-3">
            <SvceLogo size={44} />
            <span className="text-xs font-extrabold tracking-[0.3em]">SVCE PRESENTS</span>
            <span aria-hidden="true" className="h-[3px] w-6 bg-ink" />
            <HyperionBadge />
          </div>

          <h1 data-reveal="text" className="font-display leading-[0.85] tracking-wide">
            <span className="text-outline block text-[clamp(4.5rem,17vw,9.5rem)] text-comic-yellow">HYPERION</span>
            <span className="mt-2 block text-[clamp(2.25rem,7vw,4.25rem)] text-ink">
              24-HOUR <span className="text-outline-sm text-comic-red">HACKATHON</span>
            </span>
          </h1>

          <p data-reveal="up" className="font-display text-2xl tracking-wide sm:text-3xl">{siteConfig.tagline}</p>

          <p data-reveal="up" className="max-w-xl text-pretty text-lg leading-relaxed text-ink/85">
            Every great innovation starts with a question. Bring your ideas, collaborate across disciplines and
            turn imagination into something real.
          </p>

          <ul data-reveal="up" data-stagger="80" className="grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
            {highlights.map(({ icon: Icon, label, className }) => (
              <li
                key={label}
                data-reveal="pop"
                className={`comic-shadow-sm flex items-center gap-3 border-[3px] border-ink px-4 py-2.5 text-sm font-extrabold uppercase tracking-wider ${className}`}
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <p data-reveal="left" className="inline-flex items-center gap-3 bg-ink px-5 py-3 font-display text-2xl tracking-wide text-comic-yellow">
            <CalendarClock className="size-6" aria-hidden="true" />
            {siteConfig.eventDateLabel ?? 'DATE TO BE ANNOUNCED'}
          </p>

          <div data-reveal="up" className="flex flex-col gap-3">
            <RegisterButton />
            {!siteConfig.registrationOpensAt ? (
              <p className="text-sm font-semibold text-ink/70">
                The official registration form link will be published on this website.
              </p>
            ) : null}
          </div>
        </div>

        <figure className="relative mx-auto w-full max-w-xl pt-12 lg:pt-16">
          <figcaption
            data-reveal="pop"
            style={{ ['--reveal-delay' as string]: '650ms' }}
            className="comic-shadow-sm absolute left-0 top-0 z-10 -rotate-3 border-[3px] border-ink bg-comic-yellow px-3 py-1 text-xs font-extrabold uppercase tracking-[0.2em]">
            Meanwhile, at SVCE…
          </figcaption>
          <div
            data-reveal="bubble"
            className="speech-bubble absolute -top-1 right-2 z-10 max-w-[70%] rotate-2 bg-paper px-5 py-3 sm:right-6 lg:top-0"
            style={{ ['--tail-x' as string]: '22%', ['--reveal-delay' as string]: '500ms' }}
          >
            <p className="font-display text-xl leading-tight tracking-wide sm:text-2xl">
              YOUR NEXT BIG IDEA STARTS HERE!
            </p>
          </div>
          <div
            data-reveal="pop"
            style={{ ['--reveal-delay' as string]: '200ms' }}
            className="comic-shadow-lg relative rotate-1 border-4 border-ink bg-paper p-2 transition-transform duration-300 hover:rotate-0">
            <Image
              src="/images/hero-collab.png"
              alt="Five students huddle around a workbench building a drone with a circuit board, soldering iron and a laptop full of code."
              width={1024}
              height={1024}
              priority
              sizes="(max-width: 1024px) 100vw, 36rem"
              className="aspect-square h-auto w-full border-[3px] border-ink object-cover"
            />
          </div>
          <Starburst parallax={0.12} className="animate-wobble -bottom-6 -right-3 z-10 size-28 text-3xl sm:size-32 sm:text-4xl">
            BUILD!
          </Starburst>
        </figure>
      </div>
    </section>
  )
}
