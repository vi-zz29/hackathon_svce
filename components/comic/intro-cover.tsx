'use client'

import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { HyperionBadge, Starburst, SvceLogo } from './primitives'

export type IntroPhase = 'cover' | 'turning' | 'done'

const COVER_ALT =
  'Five students rallying around an idea: one raises a glowing light bulb, others hold a laptop, a notebook, a robotic arm and a wrench.'

const openButtonClass =
  'comic-shadow inline-flex items-center gap-2 border-[3px] border-ink bg-comic-red font-display leading-none tracking-wide text-paper transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-comic-blue active:translate-x-0.5 active:translate-y-0.5'

const skipButtonClass =
  'font-extrabold tracking-[0.2em] text-ink underline decoration-[3px] underline-offset-4 hover:text-comic-red focus-visible:outline-2 focus-visible:outline-ink'

type CoverProps = {
  phase: IntroPhase
  onOpen: () => void
  onSkip: () => void
}

/** Portrait comic cover, shown on phones only. */
function MobileCover({ phase, onOpen, onSkip }: CoverProps) {
  return (
    <article className="@container comic-shadow-lg relative flex h-full max-h-[64rem] w-full max-w-[min(100%,calc((100dvh-1.5rem)*0.64),38rem)] flex-col border-4 border-ink bg-ink md:hidden">
      <header className="flex items-center justify-between gap-2 px-3 py-2">
        <HyperionBadge className="border-comic-yellow bg-transparent text-comic-yellow text-base" />
        <p className="hidden truncate text-[0.65rem] font-extrabold tracking-[0.25em] text-comic-yellow @[22rem]:block">
          {siteConfig.edition}
        </p>
        <SvceLogo size={36} priority />
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden border-y-4 border-ink bg-[#e63329]">
        <Image
          src="/images/cover-art.png"
          alt={COVER_ALT}
          fill
          priority
          sizes="(max-width: 767px) 100vw, 50vw"
          className="object-contain object-center"
        />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-ink/55 via-ink/20 to-transparent px-[5cqw] pb-[10cqw] pt-[4cqw]">
          <p className="text-[2.6cqw] font-extrabold tracking-[0.3em] text-comic-yellow">SVCE PRESENTS</p>
          <h1 className="text-outline font-display text-[23cqw] leading-[0.85] tracking-wide text-comic-yellow">
            HYPERION
          </h1>
          <p className="text-outline-sm mt-[1cqw] font-display text-[7.5cqw] leading-none tracking-wide text-paper">
            24-HOUR HACKATHON
          </p>
        </div>

        <div
          className="speech-bubble !absolute right-[4cqw] top-[52%] -rotate-3 bg-paper px-[4cqw] py-[2cqw]"
          style={{ ['--tail-x' as string]: '20%' }}
        >
          <p className="font-display text-[4.6cqw] leading-none tracking-wide text-ink">WHAT WILL YOU BUILD?</p>
        </div>

        <Starburst className="animate-wobble bottom-[4cqw] left-[3cqw] size-[24cqw] text-[5.5cqw]" color="bg-comic-yellow">
          24 HRS!
        </Starburst>
      </div>

      <div className="flex flex-col gap-[3cqw] bg-comic-yellow px-[5cqw] py-[4cqw]">
        <p className="text-pretty font-display text-[5cqw] leading-tight tracking-wide text-ink">{siteConfig.tagline}</p>
        <div className="flex flex-wrap items-center gap-x-[5cqw] gap-y-3">
          <button
            type="button"
            onClick={onOpen}
            disabled={phase !== 'cover'}
            autoFocus
            className={`${openButtonClass} px-[5cqw] py-[2cqw] text-[6cqw]`}
          >
            OPEN THE CHALLENGE
            <ArrowRight className="size-[1em]" aria-hidden="true" />
          </button>
          <button type="button" onClick={onSkip} className={`${skipButtonClass} text-[3cqw]`}>
            SKIP INTRO
          </button>
        </div>
      </div>
    </article>
  )
}

/**
 * Wide comic cover for tablets and desktops. It uses the same max-w-7xl frame
 * and column ratio as the homepage hero, so the page underneath lines up with
 * the cover as it turns away.
 */
function WideCover({ phase, onOpen, onSkip }: CoverProps) {
  return (
    <article className="comic-shadow-lg relative hidden h-full max-h-[56rem] w-full max-w-7xl flex-col border-4 border-ink bg-ink md:flex">
      <header className="flex items-center justify-between gap-4 px-5 py-2.5">
        <HyperionBadge className="border-comic-yellow bg-transparent text-xl text-comic-yellow" />
        <p className="truncate text-xs font-extrabold tracking-[0.3em] text-comic-yellow">{siteConfig.edition}</p>
        <SvceLogo size={44} priority />
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[1.05fr_1fr] border-t-4 border-ink">
        <div className="halftone relative flex min-h-0 flex-col justify-center gap-[clamp(0.75rem,2.4vh,1.75rem)] overflow-hidden border-r-4 border-ink bg-paper px-[clamp(1.5rem,4vw,4rem)] py-[clamp(1rem,3vh,2.5rem)]">
          <div className="flex flex-wrap items-center gap-3">
            <SvceLogo size={40} />
            <span className="text-xs font-extrabold tracking-[0.3em]">SVCE PRESENTS</span>
            <span aria-hidden="true" className="h-[3px] w-6 bg-ink" />
            <HyperionBadge />
          </div>

          <h1 className="font-display leading-[0.85] tracking-wide">
            <span className="text-outline block text-[clamp(4rem,min(10.5vw,18vh),10rem)] text-comic-yellow">
              HYPERION
            </span>
            <span className="mt-2 block text-[clamp(2rem,min(4.6vw,7.5vh),4.5rem)] text-ink">
              24-HOUR <span className="text-outline-sm text-comic-red">HACKATHON</span>
            </span>
          </h1>

          <p className="max-w-xl text-pretty border-l-[6px] border-comic-red pl-4 font-display text-[clamp(1.25rem,min(2.2vw,3.6vh),2.25rem)] leading-tight tracking-wide">
            {siteConfig.tagline}
          </p>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-1">
            <button
              type="button"
              onClick={onOpen}
              disabled={phase !== 'cover'}
              autoFocus
              className={`${openButtonClass} px-6 py-3 text-[clamp(1.5rem,min(2.4vw,4vh),2.25rem)]`}
            >
              OPEN THE CHALLENGE
              <ArrowRight className="size-[1em]" aria-hidden="true" />
            </button>
            <button type="button" onClick={onSkip} className={`${skipButtonClass} text-sm`}>
              SKIP INTRO
            </button>
          </div>
        </div>

        <div className="relative min-h-0 overflow-hidden bg-[#e63329] flex items-center justify-center">
          <Image
            src="/images/cover-art.png"
            alt={COVER_ALT}
            fill
            priority
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-contain object-center"
          />
          <div
            className="speech-bubble !absolute right-5 top-[46%] -rotate-3 bg-paper px-5 py-2.5"
            style={{ ['--tail-x' as string]: '20%' }}
          >
            <p className="font-display text-[clamp(1.1rem,1.8vw,1.75rem)] leading-none tracking-wide text-ink">
              WHAT WILL YOU BUILD?
            </p>
          </div>
          <Starburst
            className="animate-wobble bottom-5 left-5 size-[clamp(6rem,10vw,9rem)] text-[clamp(1.4rem,2.2vw,2.1rem)]"
            color="bg-comic-yellow"
          >
            24 HRS!
          </Starburst>
        </div>
      </div>
    </article>
  )
}

export function IntroCover({
  phase,
  onOpen,
  onSkip,
  onTurned,
}: CoverProps & { onTurned: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="HYPERION cover"
      className="page-turn-stage fixed inset-0 z-[100] overflow-hidden"
    >
      {/* Shadow cast on the page beneath; fades as the leaf lifts away */}
      <div
        aria-hidden="true"
        className="page-turn-shade pointer-events-none absolute inset-0 bg-ink/40"
        style={{ opacity: phase === 'turning' ? 0 : 1 }}
      />

      <div
        data-state={phase}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && phase === 'turning') onTurned()
        }}
        className="page-turn-leaf absolute inset-0"
      >
        {/* Front face: the comic cover */}
        <div className="page-turn-face sunburst absolute inset-0 flex items-center justify-center p-3 sm:p-6 md:p-8">
          <MobileCover phase={phase} onOpen={onOpen} onSkip={onSkip} />
          <WideCover phase={phase} onOpen={onOpen} onSkip={onSkip} />
        </div>

        {/* Back face: the reverse of the page, seen mid-turn */}
        <div aria-hidden="true" className="page-turn-face page-turn-back halftone-ink absolute inset-0 bg-paper-dark" />
      </div>
    </div>
  )
}
