'use client'

import { useId, useState } from 'react'
import { Plus } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { cn } from '@/lib/utils'
import { SectionHeading } from './primitives'

const faqs = [
  { q: 'Who can participate?', a: 'HYPERION is open exclusively to students of SVCE.' },
  { q: 'What is the team size?', a: 'Each team must consist of 2–4 members.' },
  {
    q: 'What is the theme?',
    a: 'Open Innovation. Participants can develop solutions from any engineering or interdisciplinary domain — the listed domains are examples, not mandatory tracks.',
  },
  {
    q: 'Is the hackathon interdisciplinary?',
    a: 'Yes. Participants are encouraged to collaborate and explore ideas across different engineering and interdisciplinary domains.',
  },
  { q: 'Where will the hackathon be conducted?', a: `${siteConfig.venue}.` },
  { q: 'How long is the hackathon?', a: '24 hours.' },
  {
    q: 'How do I register?',
    a: 'Use the "Register Now" button anywhere on this site, or visit hyperion.svce.ac.in/register directly. Fill in your team details and submit — you will receive a unique Registration ID as confirmation.',
  },
  {
    q: 'When will the date, schedule and prizes be announced?',
    a: 'The hackathon is on 30th November. The prize pool is ₹25,000. The detailed schedule will be announced on this website soon.',
  },
  {
    q: 'Can I edit my registration after submitting?',
    a: 'Registration edits are not currently self-serve. If you need to make a change, email the organising team with your Registration ID (HYP-XXXXXX) and they will assist you.',
  },
]

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  const baseId = useId()

  return (
    <section id="faqs" className="halftone scroll-mt-16">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading kicker="FAQs" title="Questions before" accent="the action?" />
        <ul data-stagger="70" className="mt-12 flex flex-col gap-4">
          {faqs.map((item, i) => {
            const isOpen = open === i
            const btnId = `${baseId}-btn-${i}`
            const panelId = `${baseId}-panel-${i}`
            return (
              <li key={item.q} data-reveal="up" className={cn('comic-shadow border-[3px] border-ink', isOpen ? 'bg-comic-yellow' : 'bg-paper')}>
                <h3>
                  <button
                    id={btnId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-comic-blue"
                  >
                    <span className="font-display text-2xl text-comic-red">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 font-display text-2xl tracking-wide">{item.q}</span>
                    <span
                      className={cn(
                        'grid size-9 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-paper transition-transform duration-300',
                        isOpen && 'rotate-45 bg-comic-red text-paper',
                      )}
                    >
                      <Plus className="size-5" aria-hidden="true" />
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p className="border-t-[3px] border-dashed border-ink px-5 py-4 text-lg leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
