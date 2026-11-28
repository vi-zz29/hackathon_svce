import { CalendarClock, Lock } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { SectionHeading, Starburst } from '@/components/comic/primitives'

/**
 * To re-open registrations:
 *   1. Set `registrationOpensAt` in lib/site-config.ts to a date/ISO string.
 *   2. Replace the TODO comment below with your registration form embed or component.
 */

const registrationOpen = Boolean(siteConfig.registrationOpensAt)

export default function RegisterPage() {
  return (
    <section className="halftone scroll-mt-16">
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-10 flex flex-col gap-6">
          <SectionHeading
            kicker="Join the Action"
            title="Register your"
            accent="team."
          />
          <div className="flex flex-wrap gap-3">
            <p className="inline-flex items-center gap-2 bg-ink px-4 py-2 font-display text-xl tracking-wide text-comic-yellow">
              <CalendarClock className="size-5" />
              Hackathon Date: {siteConfig.hackathonDate ?? 'DATE TO BE ANNOUNCED'}
            </p>
            <p className="inline-flex items-center gap-2 border-[3px] border-ink bg-comic-yellow px-4 py-2 font-display text-xl tracking-wide">
              Team size: {siteConfig.teamSizeMin}–{siteConfig.teamSizeMax} members
            </p>
          </div>
        </div>

        {/* Comic panel card */}
        <div className="relative">
          <Starburst
            className="animate-wobble -right-4 -top-8 z-10 size-24 text-xl sm:-right-6 sm:size-28 sm:text-2xl"
            color="bg-comic-yellow"
          >
            {registrationOpen ? 'JOIN!' : 'SOON!'}
          </Starburst>

          <div className="comic-shadow-lg border-4 border-ink bg-paper p-6 sm:p-10">
            {/* Panel header stripe */}
            <div className="mb-6 border-b-4 border-ink pb-4">
              <div
                className="speech-bubble inline-block -rotate-1 bg-paper px-5 py-2"
                style={{ ['--tail-x' as string]: '12%' }}
              >
                <p className="font-display text-2xl leading-tight tracking-wide sm:text-3xl">
                  WHAT WILL YOU BUILD?
                </p>
              </div>
            </div>

            {registrationOpen ? (
              /* ── TODO: paste registration form here when registrations reopen ── */
              /* Example: <iframe src="YOUR_GOOGLE_FORM_URL?embedded=true" width="100%" style={{ minHeight: '100vh', border: 'none' }} /> */
              <div className="py-10 text-center">
                <p className="font-display text-2xl tracking-wide">Form goes here.</p>
              </div>
            ) : (
              /* ── Registrations closed ─────────────────────────────────────── */
              <div className="flex flex-col items-center gap-6 py-12 text-center">
                <div className="inline-grid size-20 place-items-center border-[3px] border-ink bg-ink text-comic-yellow">
                  <Lock className="size-10" strokeWidth={2.5} />
                </div>
                <div className="inline-block -rotate-1 border-[3px] border-ink bg-comic-red px-6 py-3">
                  <p className="font-display text-3xl tracking-wide text-paper sm:text-4xl">
                    REGISTRATIONS CLOSED
                  </p>
                </div>
                <p className="max-w-md text-lg leading-relaxed text-ink/70">
                  Registration for HYPERION is currently closed. Follow us for announcements on when registrations reopen.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-5 py-2.5 font-display text-xl tracking-wide comic-shadow-sm hover:-translate-y-0.5 transition-transform"
                >
                  ← BACK TO HOME
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Bottom note */}
        <p className="mt-8 text-center text-sm text-ink/50">
          HYPERION · {siteConfig.college}, Bengaluru · ISSUE #01
        </p>
      </div>
    </section>
  )
}
