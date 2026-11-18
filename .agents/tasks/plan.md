# Implementation Plan — HYPERION Registration System End-to-End Fix

## Context summary

- **Stack:** Next.js 16 (App Router), Prisma 5.22, PostgreSQL 16-alpine in Docker, pnpm
- **Build:** `pnpm build` / `pnpm dev`
- **Migration:** `pnpm db:migrate` (creates migration files), `pnpm db:push` (dev push without file)
- **Seed:** `pnpm db:seed`
- **Docker:** service `postgres`, db `hyperion`, user `postgres`, password `Shivani`, port 5432, volume `pgdata`
- **No .env exists yet** — must be created before any Prisma command runs

## Decision log

1. **Member fields to keep:** The form sends `phone` and `yearOfStudy`; the schema has `semester` (Int) and `section` but no `phone`. The requirement demands phone + semester + section per member. Resolution: add `phone String` to the Prisma `Member` model, replace `yearOfStudy` in the form with separate `semester` (1–8) and `section` (A–F) selectors. The form's `EMPTY_MEMBER` and `MemberInput` type must match the validation schema exactly.

2. **Per-member `email`:** Keep it. The validation schema, service duplicate-check, and DB unique constraint all depend on it. The form already collects it. The export CSV also uses `m.email`.

3. **`yearOfStudy` in seed/CSV export:** Both `seed.ts` and the admin export `route.ts` reference `m.phone` and `m.yearOfStudy` on the member object. After schema change, `yearOfStudy` no longer exists; `semester` and `section` do. Both files must be updated.

4. **teamSize max:** Change to 4 everywhere (validation schema, site-config). The form `SIZE_OPTIONS` already stops at 4.

5. **Registration date label:** Add `registrationDateLabel: '30th November'` to `siteConfig`. Use it in `page.tsx` for the "REGISTRATION OPENS" badge, distinct from `eventDateLabel` (event day).

6. **Migration strategy:** No existing migrations folder exists. Use `pnpm db:push --force-reset` during development (acceptable since there is no production data) to sync the schema, then `pnpm db:migrate --name add_phone_to_members` to create a proper migration file for the record.

7. **contactEmail field on the form:** The form currently sends no `contactEmail`. The validation schema requires it. Looking at the form, the leader's email (`members[0].email`) is the natural contact email. The form must derive `contactEmail` from `members[0].email` before submission, so the backend receives it.

---

## Items

- [ ] 1. Create `.env` file at the workspace root with all required environment variables.

  The file must set `DATABASE_URL` pointing to the Docker postgres container on localhost (since Next.js runs outside Docker) and `ADMIN_TOKEN`.

  **File to create:** `c:\Users\vaishnavi\Downloads\hackathon\.env`

  **Content:**
  ```
  DATABASE_URL="postgresql://postgres:Shivani@localhost:5432/hyperion?schema=public"
  ADMIN_TOKEN="hyperion-admin-dev-token-2024"
  NODE_ENV=development
  ```

  **Verify:** `pnpm db:generate` completes without "DATABASE_URL is required" error. (Also confirms Prisma can read the env.)

---

- [ ] 2. Add `phone` field to the `Member` model in `prisma/schema.prisma`.

  Insert `phone String` after the `fullName` line. Also add a `@@map` comment clarifying intent. No other model changes are needed — `semester`, `section`, and `email` already exist and match what the validation schema expects.

  **File to modify:** `prisma/schema.prisma`

  Change the `Member` model body from:
  ```prisma
  fullName    String   @map("full_name")
  usn         String
  department  String
  semester    Int      // 1–8
  section     String
  email       String
  ```
  to:
  ```prisma
  fullName    String   @map("full_name")
  phone       String                        // contact phone number
  usn         String
  department  String
  semester    Int      // 1–8
  section     String
  email       String
  ```

  **Verify:** `pnpm db:generate` succeeds (Prisma client regenerated with the `phone` field).

---

- [ ] 3. Run the Prisma migration to apply the schema change to the Docker database.

  Start the Docker postgres container first if it is not running, then push the schema change.

  **Commands (in order):**
  ```powershell
  # Ensure Docker postgres is running
  docker compose up -d postgres

  # Wait for healthy (optional but safe)
  Start-Sleep -Seconds 5

  # Push schema to DB (dev workflow — creates/alters tables)
  pnpm db:push

  # OR: create a named migration file (for the record)
  # pnpm db:migrate --name add_phone_to_members
  ```

  Use `pnpm db:push` for the dev environment since there is no existing migrations folder and no production data. This creates the `phone` column in the `members` table.

  **Verify:**
  ```powershell
  docker exec -it $(docker compose ps -q postgres) psql -U postgres -d hyperion -c "\d members"
  ```
  Output must include a `phone` column of type `text` or `character varying`.

---

- [ ] 4. Fix `lib/validation/registration.ts` — add `phone` to `memberSchema`, enforce teamSize max 4, fix member array max.

  **File to modify:** `lib/validation/registration.ts`

  Changes:
  a. In `memberSchema`, add a `phone` field after `fullName`:
     ```ts
     phone: z
       .string()
       .min(10, 'Phone number must be at least 10 digits')
       .max(15, 'Phone number is too long')
       .regex(/^[+\d\s\-()]{10,15}$/, 'Enter a valid phone number')
       .trim(),
     ```
  b. Remove `yearOfStudy` from `memberSchema` entirely — it is replaced by the already-present `semester` and `section` fields.
  c. In `registrationSchema`, change `teamSize` `.max(10, ...)` to `.max(4, 'Maximum team size is 4')`.
  d. In `registrationSchema`, change the `members` array `.max(10, ...)` to `.max(4, 'Maximum 4 members allowed')`.
  e. In `normalizeRegistration`, remove `yearOfStudy` from the member spread if it appears there (it currently does not, but confirm).

  **Verify:** `pnpm build` — TypeScript compilation passes with no type errors in this file or any file importing `MemberInput`.

---

- [ ] 5. Fix `RegisterForm.tsx` — replace `yearOfStudy` with `semester` + `section` selectors, derive `contactEmail`, align `EMPTY_MEMBER`.

  **File to modify:** `app/register/RegisterForm.tsx`

  Changes (preserve all existing visual design and structure):

  a. **`EMPTY_MEMBER`** — replace:
     ```ts
     const EMPTY_MEMBER: MemberInput = {
       fullName: '',
       email: '',
       phone: '',
       department: '',
       yearOfStudy: 1,
       usn: '',
     }
     ```
     with:
     ```ts
     const EMPTY_MEMBER: MemberInput = {
       fullName: '',
       email: '',
       phone: '',
       department: '',
       semester: 1,
       section: 'A',
       usn: '',
     }
     ```

  b. **`YEAR_OPTIONS`** — remove this constant entirely. Add two new constants:
     ```ts
     import { SEMESTERS, SECTIONS } from '@/lib/validation/registration'
     const SEMESTER_OPTIONS = SEMESTERS.map((s) => ({ value: s, label: `Semester ${s}` }))
     const SECTION_OPTIONS = SECTIONS.map((s) => ({ value: s, label: `Section ${s}` }))
     ```
     (Add `SEMESTERS` and `SECTIONS` to the existing import from `@/lib/validation/registration`.)

  c. **`MemberBlock` — replace the "Year of Study" field** with two fields: Semester selector and Section selector. Remove the `ComicSelect` for `yearOfStudy` and replace with:
     ```tsx
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
     ```
     The Phone field is already in the form and correct — do not remove it.

  d. **`handleSubmit` payload** — add `contactEmail` derived from the leader's email. Change the `payload` construction:
     ```ts
     const payload: RegistrationInput = {
       teamName,
       teamSize,
       contactEmail: members[0]?.email ?? '',   // ← ADD THIS LINE
       members,
       domainInterest: domainInterest as RegistrationInput['domainInterest'] || null,
       projectNote: projectNote || null,
       dietaryNote: dietaryNote || null,
       consent: consent as true,
       website,
     }
     ```

  e. **`handleMemberChange`** — the `val` type `string | number` already works for `semester` (number) and `section` (string). No change needed.

  **Verify:** `pnpm build` — no TypeScript errors. Visual inspection: the form renders Semester and Section selects where Year of Study was.

---

- [ ] 6. Fix `lib/site-config.ts` — set `teamSizeMax: 4`, add `registrationDateLabel`.

  **File to modify:** `lib/site-config.ts`

  Changes:
  a. Change `teamSizeMax: 10` to `teamSizeMax: 4`.
  b. Add a new field `registrationDateLabel` after `eventDateLabel`:
     ```ts
     /** Human-readable registration opening date, e.g. "30th November". */
     registrationDateLabel: '30th November' as string | null,
     ```

  **Verify:** `pnpm build` passes. Grep `teamSizeMax` in the build output for `4`.

---

- [ ] 7. Update `app/register/page.tsx` to show the registration date label.

  **File to modify:** `app/register/page.tsx`

  The page currently shows:
  ```tsx
  {siteConfig.eventDateLabel ?? 'DATE TO BE ANNOUNCED'}
  ```
  in the dark badge (the one with `CalendarClock`). That badge is for the event day. The requirement is to show the registration date separately.

  Change the badge block from:
  ```tsx
  <div className="flex flex-wrap gap-3">
    <p className="inline-flex items-center gap-2 bg-ink px-4 py-2 font-display text-xl tracking-wide text-comic-yellow">
      <CalendarClock className="size-5" />
      {siteConfig.eventDateLabel ?? 'DATE TO BE ANNOUNCED'}
    </p>
    <p className="inline-flex items-center gap-2 border-[3px] border-ink bg-comic-yellow px-4 py-2 font-display text-xl tracking-wide">
      Team size: {siteConfig.teamSizeMin}–{siteConfig.teamSizeMax} members
    </p>
  </div>
  ```
  to:
  ```tsx
  <div className="flex flex-wrap gap-3">
    <p className="inline-flex items-center gap-2 bg-ink px-4 py-2 font-display text-xl tracking-wide text-comic-yellow">
      <CalendarClock className="size-5" />
      Registration opens: {siteConfig.registrationDateLabel ?? 'DATE TO BE ANNOUNCED'}
    </p>
    <p className="inline-flex items-center gap-2 border-[3px] border-ink bg-comic-yellow px-4 py-2 font-display text-xl tracking-wide">
      Team size: {siteConfig.teamSizeMin}–{siteConfig.teamSizeMax} members
    </p>
  </div>
  ```

  This shows "Registration opens: 30th November" and "Team size: 2–4 members".

  **Verify:** `pnpm build` passes. Load `/register` and confirm both badges render correctly.

---

- [ ] 8. Fix `lib/services/registration.service.ts` — add `phone` to member creation, update export references.

  **File to modify:** `lib/services/registration.service.ts`

  Changes:
  a. In the `db.$transaction` block, the `tx.member.createMany` call currently maps member fields. Add `phone: m.phone` to that mapping:
     ```ts
     await tx.member.createMany({
       data: input.members.map((m, idx) => ({
         teamId: team.id,
         isLeader: idx === 0,
         fullName: m.fullName,
         phone: m.phone,          // ← ADD THIS
         usn: m.usn,
         department: m.department,
         semester: m.semester,
         section: m.section,
         email: m.email,
       })),
     })
     ```
  b. In `getRegistrationSummary`, the `select` block for members omits `phone` (correct — phone is PII, not public-safe). No change needed there.

  **Verify:** `pnpm build` — no TypeScript errors. Test via POST to `/api/register` (see item 11).

---

- [ ] 9. Fix `app/api/admin/registrations/export/route.ts` — replace `yearOfStudy` with `semester`/`section`, add `phone`.

  **File to modify:** `app/api/admin/registrations/export/route.ts`

  The CSV export currently references `m?.phone`, `m?.yearOfStudy` per member. After the schema change, `yearOfStudy` no longer exists on the `Member` model; `semester` and `section` do, and `phone` now exists.

  a. **CSV header row** — replace the per-member columns from:
     ```
     'Member N Name', 'Member N Email', 'Member N Phone', 'Member N Dept', 'Member N Year', 'Member N USN'
     ```
     to:
     ```
     'Member N Name', 'Member N Email', 'Member N Phone', 'Member N Dept', 'Member N Semester', 'Member N Section', 'Member N USN'
     ```
     Do this for all four member blocks (Member 1 through Member 4). That adds 4 columns total (one `Section` per member slot).

  b. **Data rows** — replace the per-member push from:
     ```ts
     cols.push(m?.fullName, m?.email, m?.phone, m?.department, m?.yearOfStudy, m?.usn)
     ```
     to:
     ```ts
     cols.push(m?.fullName, m?.email, m?.phone, m?.department, m?.semester, m?.section, m?.usn)
     ```

  **Verify:** `pnpm build` — no TypeScript errors (Prisma-generated types will now show `phone`, `semester`, `section` on `Member`; `yearOfStudy` will be absent and referencing it would be a compile error).

---

- [ ] 10. Fix `prisma/seed.ts` — replace `yearOfStudy` with `semester` + `section`, confirm `phone` is present.

  **File to modify:** `prisma/seed.ts`

  The seed data currently passes `phone` (already correct) and `yearOfStudy` (must be replaced) for each member.

  For each member object, replace `yearOfStudy: N` with `semester: N*2` (approximate — a 3rd-year student → semester 5 or 6) and add `section: 'A'`. Exact values do not matter for seed data; they just need to satisfy the NOT NULL constraints.

  Example replacement for the first team's members:
  ```ts
  { fullName: 'Arjun Kumar',  email: 'arjun@svce.ac.in',  phone: '9876543210', department: 'Electronics',      semester: 5, section: 'A', usn: 'SVCE21EC001', isLeader: true  },
  { fullName: 'Priya Sharma', email: 'priya@svce.ac.in',  phone: '9876543211', department: 'Computer Science', semester: 3, section: 'B', usn: 'SVCE22CS045', isLeader: false },
  { fullName: 'Ravi Verma',   email: 'ravi@svce.ac.in',   phone: '9876543212', department: 'Mechanical',       semester: 5, section: 'A', usn: 'SVCE21ME022', isLeader: false },
  ```

  Apply the same pattern to the Neural Nexus team members.

  **Verify:** `pnpm db:seed` runs without error. Then:
  ```powershell
  docker exec -it $(docker compose ps -q postgres) psql -U postgres -d hyperion -c "SELECT full_name, phone, semester, section FROM members LIMIT 5;"
  ```
  Should return rows with phone numbers, semesters, and sections populated.

---

- [ ] 11. End-to-end test via PowerShell `Invoke-WebRequest`.

  Run `pnpm dev` (or ensure the dev server is running on port 3000), then execute the following tests in a separate PowerShell terminal.

  **Test A — Valid registration (2-member team, should return 201):**
  ```powershell
  $body = @{
    teamName      = "Test Blasters"
    teamSize      = 2
    contactEmail  = "leader@svce.ac.in"
    members       = @(
      @{ fullName="Alice Leader"; email="leader@svce.ac.in"; phone="9876500001"; department="Computer Science"; semester=5; section="A"; usn="SVCE21CS999" },
      @{ fullName="Bob Member";   email="member@svce.ac.in"; phone="9876500002"; department="Mechanical";       semester=3; section="B"; usn="SVCE22ME888" }
    )
    domainInterest = $null
    projectNote    = $null
    dietaryNote    = $null
    consent        = $true
    website        = ""
  } | ConvertTo-Json -Depth 5

  Invoke-WebRequest -Uri "http://localhost:3000/api/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
  ```
  Expected: HTTP 201, body `{"ok":true,"registrationId":"HYP-XXXXXX"}`.

  **Test B — Duplicate USN (should return 409):**
  Re-submit the same payload. Expected: HTTP 409 with `code: "DUPLICATE_EMAIL"` or `"DUPLICATE_USN"`.

  **Test C — Team size 1 (should return 422):**
  ```powershell
  $body2 = @{ teamName="Lone Wolf"; teamSize=1; contactEmail="x@svce.ac.in"; members=@(@{fullName="X";email="x@svce.ac.in";phone="9876500099";department="CS";semester=1;section="A";usn="SVCE99CS001"}); consent=$true; website="" } | ConvertTo-Json -Depth 5
  Invoke-WebRequest -Uri "http://localhost:3000/api/register" -Method POST -ContentType "application/json" -Body $body2
  ```
  Expected: HTTP 422, `fieldErrors` mentioning teamSize.

  **Test D — Team size 5 (should return 422):**
  Construct a payload with `teamSize: 5` and 5 members. Expected: HTTP 422.

---

- [ ] 12. Verify persisted data in PostgreSQL via `docker exec`.

  After Test A succeeds, run:

  ```powershell
  # List teams
  docker exec -it $(docker compose ps -q postgres) psql -U postgres -d hyperion -c "SELECT registration_code, team_name, team_size, contact_email FROM teams ORDER BY created_at DESC LIMIT 5;"

  # List members with all required fields
  docker exec -it $(docker compose ps -q postgres) psql -U postgres -d hyperion -c "SELECT full_name, phone, department, semester, section, usn, email FROM members ORDER BY created_at DESC LIMIT 10;"

  # Confirm no member has NULL phone
  docker exec -it $(docker compose ps -q postgres) psql -U postgres -d hyperion -c "SELECT COUNT(*) FROM members WHERE phone IS NULL;"
  ```

  Expected: teams row appears, members rows appear with all fields populated, NULL-phone count is 0.

  **Persistence test** (verify data survives restart):
  ```powershell
  docker compose restart postgres
  Start-Sleep -Seconds 5
  docker exec -it $(docker compose ps -q postgres) psql -U postgres -d hyperion -c "SELECT registration_code, team_name FROM teams;"
  ```
  Expected: same rows still present.

---

## Dependency order

Items must be executed in this sequence:
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

- Item 1 (.env) must come before 3 (migration) — Prisma needs DATABASE_URL.
- Item 2 (schema) must come before 3 (migration) and before 8 (service) and before 9 (CSV export).
- Item 3 (migration) must come before 10 (seed) and before 11 (E2E test).
- Items 4–9 can be edited in parallel after item 2 is done, but the build (item 11's prerequisite) must run after all of 4–9 are complete.
- Item 11 requires the dev server to be running and items 1–10 to be complete.
- Item 12 follows item 11.

## Files changed summary

| File | Action |
|------|--------|
| `.env` | Create |
| `prisma/schema.prisma` | Modify — add `phone String` to `Member` |
| `lib/validation/registration.ts` | Modify — add `phone` to `memberSchema`, remove `yearOfStudy`, clamp `teamSize`/`members` max to 4 |
| `app/register/RegisterForm.tsx` | Modify — replace `yearOfStudy` with `semester`+`section`, fix `EMPTY_MEMBER`, add `contactEmail` to payload |
| `lib/site-config.ts` | Modify — `teamSizeMax: 4`, add `registrationDateLabel: '30th November'` |
| `app/register/page.tsx` | Modify — show `registrationDateLabel` in registration-opens badge |
| `lib/services/registration.service.ts` | Modify — add `phone: m.phone` to `member.createMany` data |
| `app/api/admin/registrations/export/route.ts` | Modify — replace `yearOfStudy` with `semester`+`section` in CSV headers and data rows |
| `prisma/seed.ts` | Modify — replace `yearOfStudy` with `semester`+`section` in all member objects |

No other files require changes. `app/api/register/route.ts`, `app/api/register/[registrationId]/route.ts`, `lib/db/client.ts`, `lib/env.ts`, `lib/rate-limit.ts`, and all layout/component files are correct as-is.
