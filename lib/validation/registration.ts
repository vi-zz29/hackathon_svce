/**
 * Shared Zod schema — used by the form (client) for UX validation
 * and by the API route handler (server) for authoritative validation.
 *
 * The domains come from components/comic/challenge-section.tsx.
 */
import { z } from 'zod'

export const DOMAINS = [
  'Mechanical',
  'Electrical',
  'Electronics',
  'Computer Science',
  'Artificial Intelligence',
  'Robotics',
  'Sustainability',
  'Design',
] as const

export type Domain = (typeof DOMAINS)[number]

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const
export type Semester = (typeof SEMESTERS)[number]

export const SECTIONS = ['A', 'B', 'C', 'D', 'E', 'F'] as const
export type Section = (typeof SECTIONS)[number]

// ─── Member ──────────────────────────────────────────────────────────────────

export const memberSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long')
    .trim(),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number starting with 6–9'),
  usn: z
    .string()
    .trim()
    .toUpperCase()
    .regex(
      /^1VE\d{2}[A-Z]{2}\d{3}$/,
      'USN must be in SVCE format: 1VEyyBBnnn (e.g. 1VE22CS001)',
    ),
  department: z
    .string()
    .min(2, 'Department is required')
    .max(100, 'Department name is too long')
    .trim(),
  semester: z
    .number({ invalid_type_error: 'Select a semester' })
    .int()
    .min(1, 'Semester must be 1–8')
    .max(8, 'Semester must be 1–8'),
  section: z
    .string()
    .min(1, 'Section is required')
    .max(5, 'Section is too long')
    .trim()
    .toUpperCase(),
  email: z
    .string()
    .email('Enter a valid email address')
    .max(254, 'Email is too long')
    .trim()
    .toLowerCase(),
})

export type MemberInput = z.infer<typeof memberSchema>

// ─── Team ─────────────────────────────────────────────────────────────────────

export const registrationSchema = z
  .object({
    teamName: z
      .string()
      .min(2, 'Team name must be at least 2 characters')
      .max(60, 'Team name must be 60 characters or fewer')
      .trim(),
    teamSize: z
      .number({ invalid_type_error: 'Select a team size' })
      .int()
      .min(2, 'Minimum team size is 2')
      .max(4, 'Maximum team size is 4'),
    contactEmail: z
      .string()
      .email('Enter a valid contact email')
      .max(254)
      .trim()
      .toLowerCase(),
    members: z
      .array(memberSchema)
      .min(2, 'At least 2 members are required')
      .max(4, 'Maximum 4 members allowed'),
    domainInterest: z
      .enum(DOMAINS, { errorMap: () => ({ message: 'Select a valid domain' }) })
      .optional()
      .nullable(),
    projectNote: z
      .string()
      .max(300, 'Project note must be 300 characters or fewer')
      .trim()
      .optional()
      .nullable(),
    dietaryNote: z
      .string()
      .max(200, 'Dietary note must be 200 characters or fewer')
      .trim()
      .optional()
      .nullable(),
    consent: z.literal(true, {
      errorMap: () => ({ message: 'You must accept the rules and code of conduct' }),
    }),
    // Honeypot — must be empty; filled by bots
    website: z.string().max(0, '').optional(),
  })
  .refine((data) => data.members.length === data.teamSize, {
    message: 'Number of members must match team size',
    path: ['teamSize'],
  })

export type RegistrationInput = z.infer<typeof registrationSchema>

// ─── Server-side normalizer ───────────────────────────────────────────────────

export function normalizeRegistration(input: RegistrationInput): RegistrationInput {
  return {
    ...input,
    teamName: input.teamName.trim(),
    contactEmail: input.contactEmail.toLowerCase().trim(),
    members: input.members.map((m) => ({
      ...m,
      phone: m.phone.trim(),
      email: m.email.toLowerCase().trim(),
      usn: m.usn.toUpperCase().trim(),
      section: m.section.toUpperCase().trim(),
    })),
  }
}
