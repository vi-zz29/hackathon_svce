'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navLinks, siteConfig } from '@/lib/site-config'
import { cn } from '@/lib/utils'
import { HyperionBadge, SvceLogo } from './primitives'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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
                  href={`#${link.id}`}
                  aria-current={active === link.id ? 'true' : undefined}
                  className={cn(
                    'inline-block border-[3px] px-2.5 py-1 text-xs font-extrabold uppercase tracking-[0.12em] transition-transform hover:-rotate-2',
                    active === link.id
                      ? 'comic-shadow-sm -rotate-2 border-ink bg-comic-yellow'
                      : 'border-transparent hover:border-ink',
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
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
                href={`#${link.id}`}
                onClick={() => setOpen(false)}
                className={cn(
                  'comic-shadow-sm block border-[3px] border-ink px-3 py-2 text-center font-display text-xl tracking-wide',
                  active === link.id ? 'bg-comic-yellow' : 'bg-paper',
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
