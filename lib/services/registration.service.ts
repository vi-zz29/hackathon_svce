/**
 * Registration service — all business logic lives here.
 * Server-only. Never import from client components.
 */
import { db } from '@/lib/db'
import { normalizeRegistration, type RegistrationInput } from '@/lib/validation/registration'
import { siteConfig } from '@/lib/site-config'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RegistrationStatus = 'not_open' | 'open' | 'closed' | 'full'

export interface StatusResult {
  status: RegistrationStatus
  spotsLeft?: number
  totalTeams?: number
  maxTeams?: number
}

export interface CreateResult {
  registrationId: string
}

export interface ServiceError {
  code: string
  message: string
  fieldErrors?: Record<string, string>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateRegistrationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)]
  }
  return `HYP-${suffix}`
}

async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generateRegistrationCode()
    const existing = await db.team.findUnique({ where: { registrationCode: code } })
    if (!existing) return code
  }
  throw new Error('Could not generate unique registration code')
}

// ─── Status ───────────────────────────────────────────────────────────────────

export async function getRegistrationStatus(): Promise<StatusResult> {
  const { registrationOpensAt, registrationClosesAt, maxTeams } = siteConfig
  const now = new Date()

  if (!registrationOpensAt) return { status: 'not_open' }

  const opensAt = new Date(registrationOpensAt)
  if (now < opensAt) return { status: 'not_open' }

  if (registrationClosesAt) {
    const closesAt = new Date(registrationClosesAt)
    if (now > closesAt) return { status: 'closed' }
  }

  if (maxTeams) {
    const totalTeams = await db.team.count({
      where: { status: { in: ['confirmed', 'pending'] } },
    })
    const spotsLeft = Math.max(0, maxTeams - totalTeams)
    if (spotsLeft === 0) return { status: 'full', spotsLeft: 0, totalTeams, maxTeams }
    return { status: 'open', spotsLeft, totalTeams, maxTeams }
  }

  return { status: 'open' }
}

// ─── Create registration ──────────────────────────────────────────────────────

export async function createRegistration(
  raw: RegistrationInput,
): Promise<CreateResult | { error: ServiceError }> {
  const input = normalizeRegistration(raw)

  // 1. Check status
  const statusResult = await getRegistrationStatus()
  if (statusResult.status !== 'open') {
    return {
      error: {
        code: 'REGISTRATION_NOT_OPEN',
        message:
          statusResult.status === 'full'
            ? 'All team slots are filled.'
            : statusResult.status === 'closed'
            ? 'Registration is closed.'
            : 'Registration has not opened yet.',
      },
    }
  }

  // 2. Duplicate team name (case-insensitive)
  const existingTeam = await db.team.findFirst({
    where: { teamName: { equals: input.teamName, mode: 'insensitive' } },
  })
  if (existingTeam) {
    return {
      error: {
        code: 'DUPLICATE_TEAM_NAME',
        message: 'This team name is already taken.',
        fieldErrors: { teamName: 'This team name is already taken.' },
      },
    }
  }

  // 3. Duplicate emails / USNs across existing members
  const emails = input.members.map((m) => m.email)
  const usns = input.members.map((m) => m.usn)

  const [dupEmail, dupUsn] = await Promise.all([
    db.member.findFirst({ where: { email: { in: emails } } }),
    db.member.findFirst({ where: { usn: { in: usns } } }),
  ])

  if (dupEmail) {
    const idx = emails.indexOf(dupEmail.email)
    return {
      error: {
        code: 'DUPLICATE_EMAIL',
        message: `The email ${dupEmail.email} is already registered.`,
        fieldErrors: { [`members.${idx}.email`]: 'This email is already registered.' },
      },
    }
  }

  if (dupUsn) {
    const idx = usns.indexOf(dupUsn.usn)
    return {
      error: {
        code: 'DUPLICATE_USN',
        message: `The USN ${dupUsn.usn} is already registered.`,
        fieldErrors: { [`members.${idx}.usn`]: 'This USN is already registered.' },
      },
    }
  }

  // 4. Duplicate emails / USNs within this submission
  const emailSet = new Set<string>()
  const usnSet = new Set<string>()
  for (let i = 0; i < input.members.length; i++) {
    const m = input.members[i]
    if (emailSet.has(m.email)) {
      return {
        error: {
          code: 'DUPLICATE_EMAIL_IN_TEAM',
          message: 'Two members cannot share the same email.',
          fieldErrors: { [`members.${i}.email`]: 'Already used by another member.' },
        },
      }
    }
    if (usnSet.has(m.usn)) {
      return {
        error: {
          code: 'DUPLICATE_USN_IN_TEAM',
          message: 'Two members cannot share the same USN.',
          fieldErrors: { [`members.${i}.usn`]: 'Already used by another member.' },
        },
      }
    }
    emailSet.add(m.email)
    usnSet.add(m.usn)
  }

  // 5. Generate unique code
  const registrationCode = await uniqueCode()

  // 6. Transactional insert — team + all members atomically
  try {
    await db.$transaction(async (tx) => {
      const team = await tx.team.create({
        data: {
          registrationCode,
          teamName: input.teamName,
          teamSize: input.teamSize,
          contactEmail: input.contactEmail,
          domainInterest: input.domainInterest ?? null,
          projectNote: input.projectNote ?? null,
          dietaryNote: input.dietaryNote ?? null,
          consentAcceptedAt: new Date(),
          status: 'confirmed',
        },
      })

      await tx.member.createMany({
        data: input.members.map((m, idx) => ({
          teamId: team.id,
          isLeader: idx === 0,
          fullName: m.fullName,
          phone: m.phone,
          usn: m.usn,
          department: m.department,
          semester: m.semester,
          section: m.section,
          email: m.email,
        })),
      })

      await tx.registrationEvent.create({
        data: {
          teamId: team.id,
          type: 'created',
          metadata: { registrationCode, teamSize: input.teamSize },
        },
      })
    })

    return { registrationId: registrationCode }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)

    if (msg.includes('members_email_key')) {
      return { error: { code: 'DUPLICATE_EMAIL', message: 'An email is already registered.', fieldErrors: { 'members.0.email': 'Already registered.' } } }
    }
    if (msg.includes('members_usn_key')) {
      return { error: { code: 'DUPLICATE_USN', message: 'A USN is already registered.', fieldErrors: { 'members.0.usn': 'Already registered.' } } }
    }
    if (msg.includes('registration_code')) {
      return { error: { code: 'DUPLICATE_TEAM_NAME', message: 'Team name already taken.', fieldErrors: { teamName: 'Already taken.' } } }
    }

    console.error('[registration.service] tx error:', msg)
    return { error: { code: 'INTERNAL_ERROR', message: 'Registration failed. Please try again.' } }
  }
}

// ─── Public summary ───────────────────────────────────────────────────────────

export async function getRegistrationSummary(registrationCode: string) {
  const team = await db.team.findUnique({
    where: { registrationCode },
    include: {
      members: {
        select: {
          id: true,
          isLeader: true,
          fullName: true,
          usn: true,
          department: true,
          semester: true,
          section: true,
          // email omitted — not public-safe
        },
        orderBy: [{ isLeader: 'desc' }, { createdAt: 'asc' }],
      },
    },
  })

  if (!team) return null

  return {
    registrationCode: team.registrationCode,
    teamName: team.teamName,
    teamSize: team.teamSize,
    domainInterest: team.domainInterest,
    status: team.status,
    createdAt: team.createdAt,
    members: team.members,
  }
}
