import { CalendarClock } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { SectionHeading, Starburst } from '@/components/comic/primitives'

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
          <p className="max-w-2xl text-pretty text-lg leading-relaxed text-ink/80">
            Fill in your team details below. The team leader (member #1) is the primary contact.
            All members must be current SVCE students.
          </p>
        </div>

        {/* Comic panel card */}
        <div className="relative">
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

            {/* Google Form embed */}
            <div className="w-full overflow-hidden">
              <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSezFsgSAXNPY9pFXWZo0_JXk_NZA1_I9qCL2Kn32Ktdj-YpVQ/viewform?embedded=true"
                width="100%"
                style={{ minHeight: '100vh', border: 'none' }}
                title="HYPERION Registration Form"
                loading="lazy"
              >
                Loading form…
              </iframe>
            </div>
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
