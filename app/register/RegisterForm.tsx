'use client'

import { useCallback, useId, useRef, useState } from 'react'
import { CheckCircle, ChevronDown, ChevronUp, Trophy, UserPlus, X } from 'lucide-react'
import { registrationSchema, DOMAINS, SEMESTERS, SECTIONS, type RegistrationInput, type MemberInput } from '@/lib/validation/registration'
import { siteConfig } from '@/lib/site-config'
import { ComicInput, ComicSelect, ComicTextarea, ComicCheckbox, SubmitButton } from '@/components/form'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormState =
  | { stage: 'idle' }
  | { stage: 'submitting' }
  | { stage: 'success'; registrationId: string; teamName: string; teamSize: number }
  | { stage: 'error'; message: string }

type FieldErrors = Partial<Record<string, string>>

const EMPTY_MEMBER: MemberInput = {
  fullName: '',
  phone: '',
  email: '',
  usn: '',
  department: '',
  semester: 1,
  section: 'A',
}

const SEMESTER_OPTIONS = SEMESTERS.map((s) => ({ value: s, label: `Semester ${s}` }))
const SECTION_OPTIONS = SECTIONS.map((s) => ({ value: s, label: `Section ${s}` }))
const SIZE_OPTIONS = [2, 3, 4].map((n) => ({ value: n, label: `${n} members` }))
const DOMAIN_OPTIONS = DOMAINS.map((d) => ({ value: d, label: d }))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFieldError(errors: FieldErrors, path: string): string | undefined {
  return errors[path]
}

// ─── Member block ─────────────────────────────────────────────────────────────

function MemberBlock({
  index,
  value,
  errors,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number
  value: MemberInput
  errors: FieldErrors
  onChange: (index: number, field: keyof MemberInput, val: string | number) => void
  onRemove: (index: number) => void
  canRemove: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const isLeader = index === 0
  const prefix = `members.${index}`

  return (
    <div className={cn('border-[3px] border-ink comic-shadow', isLeader ? 'bg-comic-yellow' : 'bg-paper')}>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="font-display text-xl tracking-wide">
          {isLeader ? '★ TEAM LEADER' : `MEMBER ${index + 1}`}
        </span>
        <div className="flex items-center gap-2">
          {value.fullName && (
            <span className="hidden text-sm font-semibold text-ink/60 sm:block">
              {value.fullName}
            </span>
          )}
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="inline-grid size-8 place-items-center border-[3px] border-ink bg-comic-red text-paper focus-visible:outline-4 focus-visible:outline-comic-blue"
              aria-label={`Remove member ${index + 1}`}
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-grid size-8 place-items-center border-[3px] border-ink bg-paper focus-visible:outline-4 focus-visible:outline-comic-blue"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse member' : 'Expand member'}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="grid gap-4 border-t-[3px] border-ink bg-paper px-4 py-5 sm:grid-cols-2">
          <ComicInput
            label="Full Name"
            required
            value={value.fullName}
            onChange={(e) => onChange(index, 'fullName', e.target.value)}
            error={getFieldError(errors, `${prefix}.fullName`)}
            autoComplete="name"
          />
          <ComicInput
            label="College Email"
            type="email"
            required
            value={value.email}
            onChange={(e) => onChange(index, 'email', e.target.value)}
            error={getFieldError(errors, `${prefix}.email`)}
            hint="Use your official SVCE email"
            autoComplete="email"
          />
          <ComicInput
            label="Phone"
            type="tel"
            required
            value={value.phone}
            onChange={(e) => onChange(index, 'phone', e.target.value)}
            error={getFieldError(errors, `${prefix}.phone`)}
            autoComplete="tel"
          />
          <ComicInput
            label="Department"
            required
            value={value.department}
            onChange={(e) => onChange(index, 'department', e.target.value)}
            error={getFieldError(errors, `${prefix}.department`)}
            placeholder="e.g. Computer Science"
          />
          <ComicSelect
            label="Semester"
            required
            options={SEMESTER_OPTIONS}
            value={value.semester}
            onChange={(e) => onChange(index, 'semester', Number(e.target.value))}
            error={getFieldError(errors, `${prefix}.semester`)}
          />
          <ComicSelect
            label="Section"
            required
            options={SECTION_OPTIONS}
            value={value.section}
            onChange={(e) => onChange(index, 'section', e.target.value)}
            error={getFieldError(errors, `${prefix}.section`)}
          />
          <ComicInput
            label="USN / Roll Number"
            required
            value={value.usn}
            onChange={(e) => onChange(index, 'usn', e.target.value)}
            error={getFieldError(errors, `${prefix}.usn`)}
            hint="Your official university seat number"
          />
        </div>
      )}
    </div>
  )
}

// ─── Success panel ────────────────────────────────────────────────────────────

function SuccessPanel({
  registrationId,
  teamName,
  teamSize,
}: {
  registrationId: string
  teamName: string
  teamSize: number
}) {
  return (
    <div className="comic-shadow-lg border-4 border-ink bg-paper">
      {/* Header */}
      <div className="sunburst border-b-4 border-ink px-6 py-5 text-center">
        <p className="font-display text-2xl tracking-wide text-paper">MISSION ACCEPTED!</p>
      </div>

      <div className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-12">
        <CheckCircle className="size-16 text-comic-blue" strokeWidth={2} />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-ink/60">
            Your Registration ID
          </p>
          <p className="inline-block border-[3px] border-ink bg-comic-yellow px-6 py-2 font-display text-5xl tracking-widest sm:text-6xl">
            {registrationId}
          </p>
          <p className="mt-1 text-sm text-ink/60">Save this — it's your proof of registration.</p>
        </div>

        <div className="w-full border-[3px] border-dashed border-ink p-4 text-left">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/60">Summary</p>
          <p className="mt-2 font-display text-2xl tracking-wide">{teamName}</p>
          <p className="text-sm text-ink/70">{teamSize} member{teamSize !== 1 ? 's' : ''}</p>
        </div>

        <div
          className="speech-bubble rotate-1 bg-comic-yellow px-8 py-4"
          style={{ ['--tail-x' as string]: '45%' }}
        >
          <p className="font-display text-2xl tracking-wide sm:text-3xl">
            SEE YOU AT HYPERION!
          </p>
        </div>

        <p className="font-display text-xl tracking-wide text-ink/50">— TO BE CONTINUED…</p>

        <a
          href="/"
          className="inline-flex items-center gap-2 border-[3px] border-ink bg-paper px-5 py-2 font-display text-lg tracking-wide comic-shadow-sm hover:-translate-y-0.5 transition-transform"
        >
          ← BACK TO HOME
        </a>
      </div>
    </div>
  )
}

// ─── Main form ────────────────────────────────────────────────────────────────

export function RegisterForm() {
  const formId = useId()
  const firstErrorRef = useRef<HTMLElement | null>(null)

  const [teamName, setTeamName] = useState('')
  const [teamSize, setTeamSize] = useState(2)
  const [contactEmail, setContactEmail] = useState('')
  const [members, setMembers] = useState<MemberInput[]>([{ ...EMPTY_MEMBER }, { ...EMPTY_MEMBER }])
  const [domainInterest, setDomainInterest] = useState('')
  const [projectNote, setProjectNote] = useState('')
  const [dietaryNote, setDietaryNote] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('') // honeypot

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formState, setFormState] = useState<FormState>({ stage: 'idle' })

  // ── Member helpers ───────────────────────────────────────────────────────────

  const handleSizeChange = useCallback((newSize: number) => {
    setTeamSize(newSize)
    setMembers((prev) => {
      if (newSize > prev.length) {
        return [...prev, ...Array.from({ length: newSize - prev.length }, () => ({ ...EMPTY_MEMBER }))]
      }
      return prev.slice(0, newSize)
    })
  }, [])

  const handleMemberChange = useCallback(
    (index: number, field: keyof MemberInput, val: string | number) => {
      setMembers((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: val }
        return next
      })
      // Clear per-field error on change
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[`members.${index}.${field}`]
        return next
      })
    },
    [],
  )

  const handleRemoveMember = useCallback((index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index))
    setTeamSize((prev) => prev - 1)
  }, [])

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const payload: RegistrationInput = {
      teamName,
      teamSize,
      contactEmail,
      members,
      domainInterest: domainInterest as RegistrationInput['domainInterest'] || null,
      projectNote: projectNote || null,
      dietaryNote: dietaryNote || null,
      consent: consent as true,
      website,
    }

    // Client-side validation
    const parsed = registrationSchema.safeParse(payload)
    if (!parsed.success) {
      const errors: FieldErrors = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.')
        if (!errors[key]) errors[key] = issue.message
      }
      setFieldErrors(errors)

      // Move focus to first invalid field
      setTimeout(() => {
        const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]')
        firstInvalid?.focus()
        firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }

    setFieldErrors({})
    setFormState({ stage: 'submitting' })

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = (await res.json()) as {
        ok: boolean
        registrationId?: string
        error?: { code: string; message: string; fieldErrors?: Record<string, string> }
      }

      if (data.ok && data.registrationId) {
        setFormState({ stage: 'success', registrationId: data.registrationId, teamName, teamSize })
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      if (data.error?.fieldErrors) {
        setFieldErrors(data.error.fieldErrors)
        setFormState({ stage: 'idle' })
        setTimeout(() => {
          const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]')
          firstInvalid?.focus()
          firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 50)
        return
      }

      setFormState({
        stage: 'error',
        message: data.error?.message ?? 'An unexpected error occurred.',
      })
    } catch {
      setFormState({
        stage: 'error',
        message: 'Could not reach the server. Check your connection and try again.',
      })
    }
  }

  // ── Success ──────────────────────────────────────────────────────────────────

  if (formState.stage === 'success') {
    return (
      <SuccessPanel
        registrationId={formState.registrationId}
        teamName={formState.teamName}
        teamSize={formState.teamSize}
      />
    )
  }

  const isPending = formState.stage === 'submitting'

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      aria-label="Team registration form"
    >
      {/* Error banner */}
      {formState.stage === 'error' && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 border-[3px] border-ink bg-comic-red px-5 py-4 text-paper"
        >
          <span className="font-display text-2xl leading-none">!</span>
          <div className="flex flex-col gap-1">
            <p className="font-display text-xl tracking-wide">SOMETHING WENT WRONG</p>
            <p className="text-sm">{formState.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setFormState({ stage: 'idle' })}
            className="ml-auto shrink-0 focus-visible:outline-2 focus-visible:outline-paper"
            aria-label="Dismiss error"
          >
            <X className="size-5" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {/* ── Team details ──────────────────────────────────────────────── */}
        <fieldset className="flex flex-col gap-5 border-[3px] border-ink p-5">
          <legend className="bg-ink px-3 py-1 font-display text-xl tracking-wide text-paper">
            TEAM DETAILS
          </legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <ComicInput
              label="Team Name"
              required
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value)
                setFieldErrors((prev) => { const n = { ...prev }; delete n.teamName; return n })
              }}
              error={getFieldError(fieldErrors, 'teamName')}
              hint="Pick something memorable — it must be unique"
              autoComplete="off"
            />
            <ComicSelect
              label="Team Size"
              required
              options={SIZE_OPTIONS}
              value={teamSize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              error={getFieldError(fieldErrors, 'teamSize')}
            />
            <ComicInput
              label="Contact Email"
              type="email"
              required
              value={contactEmail}
              onChange={(e) => {
                setContactEmail(e.target.value)
                setFieldErrors((prev) => { const n = { ...prev }; delete n.contactEmail; return n })
              }}
              error={getFieldError(fieldErrors, 'contactEmail')}
              hint="Primary contact email for the team"
              autoComplete="email"
            />
          </div>
        </fieldset>

        {/* ── Members ──────────────────────────────────────────────────── */}
        <fieldset className="flex flex-col gap-4 border-[3px] border-ink p-5">
          <legend className="bg-ink px-3 py-1 font-display text-xl tracking-wide text-paper">
            TEAM MEMBERS
          </legend>
          <p className="text-sm text-ink/60">
            Member 1 is your team leader and primary contact.
          </p>

          {members.map((member, idx) => (
            <MemberBlock
              key={idx}
              index={idx}
              value={member}
              errors={fieldErrors}
              onChange={handleMemberChange}
              onRemove={handleRemoveMember}
              canRemove={idx > 0 && members.length > 2}
            />
          ))}

          {members.length < 4 && (
            <button
              type="button"
              onClick={() => {
                setMembers((prev) => [...prev, { ...EMPTY_MEMBER }])
                setTeamSize((prev) => prev + 1)
              }}
              className="inline-flex items-center gap-2 border-[3px] border-dashed border-ink bg-paper px-4 py-2 font-display text-lg tracking-wide hover:bg-comic-yellow focus-visible:outline-4 focus-visible:outline-comic-blue"
            >
              <UserPlus className="size-5" /> ADD MEMBER
            </button>
          )}
        </fieldset>

        {/* ── Optional info ─────────────────────────────────────────────── */}
        <fieldset className="flex flex-col gap-5 border-[3px] border-ink p-5">
          <legend className="bg-ink px-3 py-1 font-display text-xl tracking-wide text-paper">
            OPTIONAL INFO
          </legend>

          <ComicSelect
            label="Domain of Interest"
            options={DOMAIN_OPTIONS}
            placeholder="Choose a domain (optional)"
            value={domainInterest}
            onChange={(e) => setDomainInterest(e.target.value)}
            error={getFieldError(fieldErrors, 'domainInterest')}
            hint="For inspiration only — you're not locked to this"
          />

          <ComicTextarea
            label="What do you want to build?"
            value={projectNote}
            onChange={(e) => setProjectNote(e.target.value)}
            maxLength={300}
            showCount
            hint="A quick idea or problem you'd like to tackle (max 300 chars)"
            placeholder="e.g. A drone-based crop monitoring system…"
            error={getFieldError(fieldErrors, 'projectNote')}
          />

          <ComicInput
            label="Dietary Preference"
            value={dietaryNote}
            onChange={(e) => setDietaryNote(e.target.value)}
            placeholder="e.g. Vegetarian, Vegan, No restrictions"
            hint="Let the organisers know about any dietary needs"
            error={getFieldError(fieldErrors, 'dietaryNote')}
          />
        </fieldset>

        {/* ── Consent ───────────────────────────────────────────────────── */}
        <ComicCheckbox
          id="consent"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked)
            setFieldErrors((prev) => { const n = { ...prev }; delete n.consent; return n })
          }}
          error={getFieldError(fieldErrors, 'consent')}
          label={
            <span>
              I confirm that all team members are SVCE students, agree to abide by the HYPERION
              rules and code of conduct, and consent to the collection and use of this information
              for event purposes.{' '}
              <span className="font-bold text-comic-red">*</span>
            </span>
          }
        />

        {/* Honeypot */}
        <ComicInput
          label="Website"
          hidden
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />

        {/* ── Submit ────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-start gap-3">
          <SubmitButton pending={isPending} />
          <p className="text-sm text-ink/60">
            Your data will only be used for HYPERION event management. No spam.
          </p>
        </div>
      </div>
    </form>
  )
}
