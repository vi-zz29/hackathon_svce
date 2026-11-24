import { siteConfig } from '@/lib/site-config'
import { SectionHeading } from './primitives'

const tones = ['bg-comic-yellow', 'bg-comic-blue', 'bg-comic-red text-paper']

// Split timeline into Day 1 (4th Dec) and Day 2 (5th Dec)
const day1 = siteConfig.timeline.filter((t) => t.time?.includes('Day 1'))
const day2 = siteConfig.timeline.filter((t) => t.time?.includes('Day 2'))

function DayGroup({
  label,
  date,
  items,
  indexOffset,
}: {
  label: string
  date: string
  items: typeof siteConfig.timeline
  indexOffset: number
}) {
  return (
    <div className="flex flex-col gap-6">
      {/* Day heading */}
      <div className="flex items-center gap-4">
        <div className="border-[3px] border-paper bg-comic-yellow px-4 py-1.5">
          <span className="font-display text-2xl tracking-wide text-ink">{label}</span>
        </div>
        <span className="font-display text-xl tracking-wide text-paper/70">{date}</span>
        <div className="h-[3px] flex-1 bg-paper/20" />
      </div>

      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <li
            key={item.title}
            data-reveal="up"
            className="group relative border-[3px] border-paper bg-paper p-6 text-ink shadow-[6px_6px_0_0_var(--comic-yellow)] transition-transform duration-200 hover:-translate-y-1"
          >
            <span
              className={`absolute -left-4 -top-5 grid size-12 place-items-center rounded-full border-[3px] border-ink font-display text-2xl ${tones[(indexOffset + i) % tones.length]}`}
              aria-hidden="true"
            >
              {indexOffset + i + 1}
            </span>
            <p className="pl-6 text-xs font-extrabold uppercase tracking-[0.2em] text-comic-red">
              {item.time?.split(' · ')[0] ?? 'Time TBA'}
            </p>
            <h3 className="mt-3 font-display text-3xl tracking-wide">{item.title}</h3>
            <p className="mt-2 leading-relaxed text-ink/80">{item.description}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function TimelineSection() {
  return (
    <section id="timeline" className="scroll-mt-16 border-y-[3px] border-ink bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading kicker="Timeline" title="The 24-hour" accent="mission" invert />

        <div className="mt-14 flex flex-col gap-14">
          <DayGroup label="Day 1" date="4th December" items={day1} indexOffset={0} />
          <DayGroup label="Day 2" date="5th December" items={day2} indexOffset={day1.length} />
        </div>
      </div>
    </section>
  )
}
