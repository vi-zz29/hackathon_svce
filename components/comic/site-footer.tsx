import { Mail, MapPin, Phone } from 'lucide-react'
import { navLinks, siteConfig } from '@/lib/site-config'
import { SvceLogo } from './primitives'

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-16 bg-ink text-paper">
      <div data-stagger="120" className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div data-reveal="up" className="flex flex-col items-start gap-5">
          <div className="flex items-center gap-4">
            <SvceLogo size={64} />
            <p className="text-outline font-display text-6xl leading-none tracking-wide text-comic-yellow">HYPERION</p>
          </div>
          <p className="font-display text-2xl tracking-wide">{siteConfig.tagline}</p>
          <p className="text-paper/75">
            24-hour interdisciplinary hackathon at {siteConfig.college}, Bengaluru.
          </p>
          <p className="flex items-start gap-2 text-paper/90">
            <MapPin className="mt-0.5 size-5 shrink-0 text-comic-yellow" aria-hidden="true" />
            {siteConfig.address}
          </p>
        </div>

        <div data-reveal="up">
          <h3 className="font-display text-3xl tracking-wide text-comic-yellow">Get in touch</h3>
          <ul className="mt-5 flex flex-col gap-3">
            <li className="flex items-center gap-2">
              <Mail className="size-5 shrink-0 text-comic-blue" aria-hidden="true" />
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="underline underline-offset-4 hover:text-comic-yellow break-all"
              >
                {siteConfig.contactEmail}
              </a>
            </li>
            {siteConfig.contacts.map((c) => (
              <li key={c.phone} className="flex items-center gap-2">
                <Phone className="size-5 shrink-0 text-comic-blue" aria-hidden="true" />
                <span className="text-paper/90">
                  <a href={`tel:${c.phone}`} className="hover:text-comic-yellow">
                    {c.phone}
                  </a>
                  <span className="ml-2 text-paper/60">{c.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label="Footer" data-reveal="up">
          <h3 className="font-display text-3xl tracking-wide text-comic-yellow">Jump to</h3>
          <ul className="mt-5 grid grid-cols-2 gap-2">
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} className="text-paper/85 hover:text-comic-yellow hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t-[3px] border-paper/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-paper/70 sm:flex-row sm:px-6 lg:px-8">
          <p>HYPERION · {siteConfig.college}, Bengaluru</p>
          <p className="font-display text-lg tracking-wide text-comic-yellow">ISSUE #01 · TO BE CONTINUED…</p>
        </div>
      </div>
    </footer>
  )
}
