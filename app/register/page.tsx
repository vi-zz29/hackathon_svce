import { CalendarClock } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { SectionHeading, Starburst } from '@/components/comic/primitives'
import { RegisterForm } from './RegisterForm'

/**
 * /register — the registration page.
 *
 * The intro cover never plays here because this page uses its own layout
 * (no ComicExperience wrapper). SiteHeader + SiteFooter are added by
 * app/register/layout.tsx.
 */
export default function RegisterPage() {
  const registrationOpen = Boolean(siteConfig.registrationOpensAt)

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
          <p className="max-w-2xl text-pretty text-lg leading-relaxed text-ink/80">
            Fill in your team details below. The team leader (member #1) is the primary contact.
            All members must be current SVCE students.
          </p>
        </div>

        {/* Comic panel card */}
        <div className="relative">
          {/* Starburst decoration */}
          <Starburst
            className="animate-wobble -right-4 -top-8 z-10 size-24 text-xl sm:-right-6 sm:size-28 sm:text-2xl"
            color="bg-comic-yellow"
          >
            JOIN!
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

            {!registrationOpen ? (
              /* ── Registration not yet open ─────────────────────────── */
              <div className="flex flex-col items-center gap-6 py-10 text-center">
                <div className="inline-block -rotate-1 border-[3px] border-ink bg-comic-yellow px-6 py-3">
                  <p className="font-display text-3xl tracking-wide sm:text-4xl">
                    REGISTRATION OPENING SOON!
                  </p>
                </div>
                <p className="max-w-md text-lg leading-relaxed text-ink/70">
                  Registration hasn't opened yet. Check back here when the official date is
                  announced.
                </p>
                <a
                  href="/#register"
                  className="inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-5 py-2.5 font-display text-xl tracking-wide comic-shadow-sm hover:-translate-y-0.5 transition-transform"
                >
                  ← BACK TO SITE
                </a>
              </div>
            ) : (
              /* ── Live registration form ─────────────────────────────── */
              <RegisterForm />
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
