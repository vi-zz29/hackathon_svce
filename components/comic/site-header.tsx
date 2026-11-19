'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Users, X } from 'lucide-react'
import { navLinks, siteConfig } from '@/lib/site-config'
import { cn } from '@/lib/utils'
import { HyperionBadge, SvceLogo } from './primitives'

const ORGANISERS = [
  'Shivani Raj Urs L',
  'R Vishnuvardhan',
  'Aman Vikas AV',
  'Mohammad Safwan',
  'Akhil Kumar Lohar',
]

const DEVELOPERS = ['Vaishnavi Shankar', 'Subhiksha R']

function CreditsPopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Team credits"
        className={cn(
          'inline-flex items-center gap-1.5 border-[3px] px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.12em] transition-transform hover:-rotate-2',
          open ? 'comic-shadow-sm -rotate-2 border-ink bg-comic-yellow' : 'border-transparent hover:border-ink',
        )}
      >
        <Users className="size-3.5" aria-hidden="true" />
        Credits
      </button>

      {open && (
        <div className="comic-shadow-lg absolute right-0 top-full z-50 mt-2 w-64 border-[3px] border-ink bg-paper p-4">
          {/* Arrow */}
          <div className="absolute -top-[11px] right-4 h-0 w-0 border-x-[8px] border-b-[10px] border-x-transparent border-b-ink" />
          <div className="absolute -top-[8px] right-[17px] h-0 w-0 border-x-[7px] border-b-[9px] border-x-transparent border-b-paper" />

          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-comic-red">
            Organised by
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {ORGANISERS.map((name) => (
              <li key={name} className="text-sm font-semibold text-ink">
                {name}
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-comic-red">
            Developed by
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {DEVELOPERS.map((name) => (
              <li key={name} className="text-sm font-semibold text-ink">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    if (!isHome) return
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => Boolean(el))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [isHome])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    if (isHome) {
      e.preventDefault()
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setOpen(false)
    } else {
      setOpen(false)
    }
  }

  function navHref(id: string) {
    return isHome ? `#${id}` : `/#${id}`
  }

  const registerOpen = Boolean(siteConfig.registrationOpensAt)
  const registerHref = siteConfig.registrationUrl ?? '#register'

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-ink bg-paper">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <SvceLogo size={38} />
          <HyperionBadge />
          <span className="sr-only">Back to home</span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={navHref(link.id)}
                  onClick={(e) => handleNavClick(e, link.id)}
                  aria-current={isHome && active === link.id ? 'true' : undefined}
                  className={cn(
                    'inline-block border-[3px] px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.12em] transition-transform hover:-rotate-2',
                    isHome && active === link.id
                      ? 'comic-shadow-sm -rotate-2 border-ink bg-comic-yellow'
                      : 'border-transparent hover:border-ink',
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
            {/* Credits icon — desktop only, sits after Contact */}
            <li>
              <CreditsPopover />
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          {registerOpen ? (
            <a
              href={registerHref}
              className="comic-shadow-sm hidden border-[3px] border-ink bg-comic-red px-4 py-1.5 font-display text-lg tracking-wide text-paper transition-transform hover:-translate-y-0.5 sm:inline-block"
            >
              REGISTER
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="hidden cursor-not-allowed border-[3px] border-ink bg-paper-dark px-4 py-1.5 font-display text-lg tracking-wide text-ink/70 sm:inline-block"
            >
              REGISTER · SOON
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="comic-shadow-sm inline-grid size-10 place-items-center border-[3px] border-ink bg-comic-yellow lg:hidden"
          >
            {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          </button>
        </div>
      </div>

      <nav
        id="mobile-menu"
        aria-label="Mobile"
        hidden={!open}
        className="halftone border-t-[3px] border-ink bg-paper lg:hidden"
      >
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-5 sm:grid-cols-4 sm:px-6">
          {navLinks.map((link) => (
            <li key={link.id}>
              <a
                href={navHref(link.id)}
                onClick={(e) => handleNavClick(e, link.id)}
                className={cn(
                  'comic-shadow-sm block border-[3px] border-ink px-3 py-2 text-center font-display text-xl tracking-wide',
                  isHome && active === link.id ? 'bg-comic-yellow' : 'bg-paper',
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Credits — mobile, shown at bottom of hamburger menu */}
        <div className="border-t-[3px] border-ink px-4 py-4">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-comic-red">
            Organised by
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {ORGANISERS.map((name) => (
              <li key={name} className="text-sm font-semibold text-ink">{name}</li>
            ))}
          </ul>
          <p className="mt-3 text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-comic-red">
            Developed by
          </p>
          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {DEVELOPERS.map((name) => (
              <li key={name} className="text-sm font-semibold text-ink">{name}</li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
