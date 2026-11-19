# HYPERION Registration System — End-to-End Implementation

The change completes the registration flow: phone field added to the Member model and persisted through the service layer, `teamSize` capped at 4 everywhere, `semester`/`section` replacing `yearOfStudy` in the form, and `contactEmail` wired from form to API to database. The migration delivers the full schema (teams, members, audit events) with all constraints. All eight E2E test scenarios passed and data was verified in PostgreSQL; persistence across a container restart was confirmed with the named `pgdata` volume.

**Watch for:** The migration file is named `add_member_phone` but its SQL creates the entire schema from scratch — the report's framing ("added `phone_number` column") is misleading, and the actual migration state needs to match what's in the database (confirmed). The `getRegistrationSummary` function omits `phone` from its member select, which is intentional for the public-safe summary but means any admin view using that function won't surface phone numbers (possible gap depending on admin requirements). There is no DB-level `CHECK` constraint enforcing team size 2–4; that enforcement lives entirely in application code.

**Verdict**: APPROVED

---

## High-level view

The five-layer stack (form → validation → API → service → DB) is fully aligned. Field names are consistent across all layers: the Zod `memberSchema`, the Prisma `Member` model, the `createMany` data mapping, and the `MemberBlock` component all use `phone`, `semester`, `section`, and `fullName` without mismatch.

The migration file name `add_member_phone` is a misnomer. The SQL it contains creates the full schema (all three tables, all indexes, all foreign keys) rather than adding a column to an existing table. If this database was freshly initialized from this migration, the result is correct. If the migration was applied to a database that already had the tables, Prisma would have detected the existing state via the migration history table and not re-run the DDL — so it would still be safe, but the name is confusing for future developers.

The 2–4 team size constraint is enforced at three application layers: the Zod schema (`teamSize` min/max, `members` array min/max), the cross-field `.refine` check that members.length must equal teamSize, and the form's SIZE_OPTIONS array being `[2, 3, 4]`. It is not enforced by a PostgreSQL `CHECK` constraint on the `team_size` column, so a direct DB write or a Prisma call that bypasses the service layer could store out-of-range values.

The `getRegistrationSummary` public endpoint intentionally excludes `phone` and `email` from the member select — a reasonable privacy default. This is worth noting because if any admin-facing feature builds on that function, it will silently omit contact data.

---

<details>
<summary>Issues (3)</summary>

1. **Migration name vs. content mismatch** — The migration file is named `add_member_phone` but creates the full schema from scratch. If a developer tries to replay or troubleshoot migrations, the name will mislead them. Rename the migration (or add a comment in the SQL header) to reflect that it is the initial schema creation, not an additive column change.

2. **No DB-level teamSize CHECK constraint** — The `team_size` column in `teams` has no `CHECK (team_size BETWEEN 2 AND 4)` constraint. Any direct database write or service-layer call that bypasses Zod will accept out-of-range values silently. Add a `CHECK` constraint in the next migration or via a `@@check` Prisma preview feature if the project wants the database to be the final enforcement layer.

3. **`getRegistrationSummary` omits phone** — The function's member select intentionally excludes `phone` for public safety, but if any admin dashboard or confirmation email uses this function, it will silently provide incomplete member data. Confirm that all admin-facing surfaces use a separate query, or document this exclusion explicitly.

</details>

---

<details>
<summary>Details</summary>

## Field alignment across all layers

The form's `EMPTY_MEMBER` initializes `phone: ''`, `semester: 1`, `section: 'A'` — matching the `memberSchema` exactly. `MemberBlock` renders a `ComicInput` for `phone` and `ComicSelect` for both `semester` and `section`, wired to `handleMemberChange` with the correct field keys. The `handleSubmit` payload passes `members` directly from state, which carries all these fields. The Zod `memberSchema` validates all of them. `normalizeRegistration` trims `phone`, lowercases `email`, uppercases `usn` and `section`. The `createMany` data mapping in the service passes every field: `fullName`, `phone`, `usn`, `department`, `semester`, `section`, `email`. The Prisma `Member` model maps `phone` to `phone_number` in the DB. All six layers are consistent — confirmed by reading each file.

## Migration file identity

The migration at `prisma/migrations/20261118145514_add_member_phone/migration.sql` contains `CREATE TABLE "teams"`, `CREATE TABLE "members"` (with `phone_number TEXT NOT NULL` present from the start), and `CREATE TABLE "registration_events"` — it is the initial schema, not an ALTER. The report describes it as "Added `phone_number` column" via `ALTER TABLE … ADD COLUMN`, which does not match the SQL in the file. The practical effect is the same if this is a fresh database, but the migration history is misleading. **Confidence: confirmed.**

## teamSize enforcement

`registrationSchema` sets `teamSize` min 2 / max 4 and `members` array min 2 / max 4, plus the cross-field refine. `SIZE_OPTIONS` in the form is `[2, 3, 4]`, preventing the UI from ever submitting 1 or 5. The API route delegates to `registrationSchema.safeParse` before calling the service, so any bypassed frontend validation is still caught. The database column has no `CHECK` constraint — an omission that makes the DB not independently enforceable. **Confidence: confirmed.**

## Transaction, atomicity, and credential safety

`db.$transaction(async (tx) => { … })` wraps team create, member createMany, and audit event create atomically. The `catch` block maps known constraint violation messages to structured `ServiceError` returns; unrecognized errors log the raw message server-side only and return `'Registration failed. Please try again.'` to the client. `getRegistrationSummary` omits `email` and `phone` from its public member projection — callers needing full contact data must query directly. **Confidence: confirmed.**

## Test coverage

Eight scenarios were run against the live API: valid 2-member and 4-member registrations, duplicate team name, teamSize 1, teamSize 5, empty team name, missing USN, invalid contactEmail. All returned the expected status codes and messages. Database rows were verified for phone, semester, and section presence. Persistence across container restart was verified. Not tested: a submission where `members.length !== teamSize` (the cross-field refine path), duplicate email within a single submission, duplicate USN within a single submission, the honeypot trap path, and the rate-limit path.

</details>

---

<details>
<summary>File map</summary>

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `phone String @map("phone_number")` to `Member`; all other member fields already present |
| `prisma/migrations/20261118145514_add_member_phone/migration.sql` | Full initial schema creation (all three tables, indexes, FKs) — name is misleading |
| `lib/validation/registration.ts` | Added `phone` to `memberSchema`; `teamSize` and `members` array max changed from 10 → 4; `normalizeRegistration` now trims `phone` |
| `lib/services/registration.service.ts` | Added `phone: m.phone` to `createMany` data mapping |
| `app/api/register/route.ts` | No functional changes; already correct |
| `app/register/RegisterForm.tsx` | Fixed `EMPTY_MEMBER`; added `contactEmail` state and field; replaced year-of-study with semester + section selects |
| `lib/site-config.ts` | `teamSizeMax` → 4; added `registrationDateLabel: '30th November'` |
| `app/register/page.tsx` | Badge now reads `registrationDateLabel` instead of the null `eventDateLabel` |
| `prisma/seed.ts` | Updated seed data to use `semester`, `section`, `phone`, and `contactEmail` |
| `app/api/admin/registrations/export/route.ts` | CSV headers updated: `Member N Year` → `Member N Semester` + `Member N Section`; phone column added |

Full diff: `git diff main` from workspace root.

</details>
