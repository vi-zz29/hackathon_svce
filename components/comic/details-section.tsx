import { CalendarClock, Clock, GraduationCap, Lightbulb, MapPin, Users } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { SectionHeading } from './primitives'

const details = [
  { label: 'Eligibility', value: 'Open exclusively to SVCE students.', icon: GraduationCap, tone: 'bg-comic-yellow' },
  { label: 'Team Size', value: '2–4 members per team.', icon: Users, tone: 'bg-comic-blue' },
  { label: 'Duration', value: '24 hours, non-stop.', icon: Clock, tone: 'bg-comic-red text-paper' },
  { label: 'Venue', value: `${siteConfig.venue}.`, icon: MapPin, tone: 'bg-paper' },
  { label: 'Theme', value: 'Hardware, ECE & AI/Software Innovation.', icon: Lightbulb, tone: 'bg-comic-yellow' },
  {
    label: 'Event Date',
    value: siteConfig.eventDateLabel ?? 'To be announced soon.',
    icon: CalendarClock,
    tone: 'bg-ink text-comic-yellow',
  },
]

export function DetailsSection() {
  return (
    <section id="details" className="halftone scroll-mt-16">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading kicker="Event Details" title="Are you ready to" accent="join the action?" />
        <dl data-stagger="90" className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(({ label, value, icon: Icon, tone }) => (
            <div
              key={label}
              data-reveal="up"
              className={`comic-shadow flex items-start gap-4 border-[3px] border-ink p-6 transition-transform duration-200 hover:-translate-y-1 hover:-rotate-1 ${tone}`}
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-paper text-ink">
                <Icon className="size-7" aria-hidden="true" strokeWidth={2.25} />
              </span>
              <div>
                <dt className="font-display text-3xl tracking-wide">{label}</dt>
                <dd className="mt-1 text-lg font-semibold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
