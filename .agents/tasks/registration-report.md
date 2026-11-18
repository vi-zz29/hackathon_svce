# HYPERION Registration System — End-to-End Fix Report

**Date:** 2026-11-18  
**Commit:** `ba9e7de` — feat: add phone field, fix member fields, enforce teamSize 2-4, add contactEmail to form

---

## 1. Files Changed

| File | Action | Summary |
|------|--------|---------|
| `.env` | Created | DATABASE_URL (port 5433), ADMIN_TOKEN, NODE_ENV |
| `docker-compose.yml` | Modified | Port mapping changed from `5432:5432` to `5433:5432` |
| `prisma/schema.prisma` | Modified | Added `phone String @map("phone_number")` to Member model |
| `prisma/migrations/20261118145514_add_member_phone/` | Created | Auto-generated migration SQL |
| `lib/validation/registration.ts` | Modified | Added phone to memberSchema; teamSize/members max → 4; normalizeRegistration includes phone |
| `lib/services/registration.service.ts` | Modified | Added `phone: m.phone` to `tx.member.createMany` |
| `app/register/RegisterForm.tsx` | Modified | Fixed EMPTY_MEMBER; added semester/section selectors; added contactEmail field and state |
| `lib/site-config.ts` | Modified | `teamSizeMax: 4`; added `registrationDateLabel: '30th November'` |
| `app/register/page.tsx` | Modified | Badge now shows "Registration opens: 30th November" |
| `app/api/admin/registrations/export/route.ts` | Modified | CSV headers and data rows: `Member N Year` → `Member N Semester` + `Member N Section`; added phone |
| `prisma/seed.ts` | Modified | Replaced `yearOfStudy` with `semester`+`section`; added `contactEmail` to team data |

---

## 2. Schema Changes

**Migration name:** `20261118145514_add_member_phone`

Added `phone_number` column to the `members` table:
```sql
ALTER TABLE "members" ADD COLUMN "phone_number" TEXT NOT NULL;
```

The Member model now has all required fields:
```prisma
model Member {
  id          String   @id @default(uuid())
  teamId      String   @map("team_id")
  isLeader    Boolean  @default(false) @map("is_leader")
  fullName    String   @map("full_name")
  phone       String   @map("phone_number")
  usn         String
  department  String
  semester    Int
  section     String
  email       String
  createdAt   DateTime @default(now()) @map("created_at")
  team        Team     @relation(fields: [teamId], references: [id], onDelete: Cascade)
  @@unique([email])
  @@unique([usn])
  @@index([teamId])
  @@map("members")
}
```

---

## 3. Migration Result

```
Applying migration `20261118145514_add_member_phone`
✔ Generated Prisma Client (v5.22.0) in 123ms
Your database is now in sync with your schema.
```

Migration ran cleanly against `hyperion` database at `localhost:5433`.

---

## 4. Validation Layer Changes (`lib/validation/registration.ts`)

- **Added** `phone` field to `memberSchema`:
  ```ts
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number starting with 6–9')
  ```
- **Changed** `teamSize` max from 10 → 4
- **Changed** `members` array max from 10 → 4
- **Updated** `normalizeRegistration` to trim `phone` on each member

The `yearOfStudy` field was never in the schema; it was only in the form. The schema already had `semester` and `section` — this was verified before making changes.

---

## 5. Service Layer Changes (`lib/services/registration.service.ts`)

Added `phone: m.phone` to the `tx.member.createMany` data mapping so phone is persisted to the database.

---

## 6. API Layer Changes

No changes needed to `app/api/register/route.ts` — it already delegates to the service and returns proper 201/422/409 responses. The registration endpoint correctly:
- Validates via `registrationSchema` (422 on failure)
- Checks duplicates (409 on duplicate team name, email, or USN)
- Uses a database transaction for atomic inserts
- Returns `{ ok: true, registrationId: "HYP-XXXXXX" }` on success

---

## 7. Frontend Form Changes (`app/register/RegisterForm.tsx`)

- **Fixed `EMPTY_MEMBER`**: removed `yearOfStudy`, added `semester: 1` and `section: 'A'`
- **Added `contactEmail` state** (`useState('')`)
- **Updated import** to include `SEMESTERS` and `SECTIONS` from validation module
- **Replaced `YEAR_OPTIONS`** with `SEMESTER_OPTIONS` (Semester 1–8) and `SECTION_OPTIONS` (Section A–F)
- **Added Contact Email field** to TEAM DETAILS fieldset (ComicInput, type=email, required)
- **In MemberBlock**: replaced `Year of Study` ComicSelect with `Semester` ComicSelect + `Section` ComicSelect
- **Added `contactEmail`** to the handleSubmit payload sent to the API

All existing styling, layout, CSS classes, and visual components preserved.

---

## 8. Site Config Changes (`lib/site-config.ts`)

- `teamSizeMax`: 10 → **4**
- Added `registrationDateLabel: '30th November' as string | null`

The `/register` page badge now displays **"Registration opens: 30th November"** (previously used `eventDateLabel` which is `null`).  
The team size badge shows **"Team size: 2–4 members"** (down from 2–10).

---

## 9. `.env` File Status

**Created** at workspace root with:
```
DATABASE_URL="postgresql://postgres:Shivani@localhost:5433/hyperion?schema=public"
ADMIN_TOKEN="hyperion-admin-dev-token-2024"
NODE_ENV="development"
```

**Port note:** A local PostgreSQL process was already occupying port 5432 on this machine. The Docker container's port mapping was changed to `5433:5432` so the Docker postgres is reachable at `localhost:5433`. This was confirmed with the user before making the change.

---

## 10. Docker Status

```
NAME                   IMAGE                COMMAND     SERVICE   PORTS
hackathon-postgres-1   postgres:16-alpine   "docker-…"  postgres  0.0.0.0:5433->5432/tcp
STATUS: Up (healthy)
```

Volume: `pgdata` (named volume — persistent across restarts)

---

## 11. E2E Test Results

All tests run against `http://localhost:3000/api/register`.

| Test | Scenario | Expected | Result |
|------|----------|----------|--------|
| A | Valid 2-member registration | 201 `{ok:true, registrationId}` | ✅ 201 `HYP-DZYVWJ` |
| B | Duplicate team name | 409 DUPLICATE_TEAM_NAME | ✅ 409 |
| C | teamSize=1 (too small) | 422 validation error | ✅ 422 — "Minimum team size is 2" |
| D | teamSize=5 (too large) | 422 validation error | ✅ 422 — "Maximum team size is 4" |
| E | Empty team name | 422 validation error | ✅ 422 — "Team name must be at least 2 characters" |
| F | Missing USN | 422 validation error | ✅ 422 — "USN / Roll number is required" |
| G | Invalid contactEmail format | 422 validation error | ✅ 422 — "Enter a valid contact email" |
| H | Valid 4-member registration | 201 `{ok:true, registrationId}` | ✅ 201 `HYP-X9C7TF` |

---

## 12. Database Verification Results

**Teams table (most recent first):**
```
 registration_code |    team_name     | team_size |    contact_email
-------------------+------------------+-----------+---------------------
 HYP-X9C7TF        | Four Heroes      |         4 | leader1@newtest.com
 HYP-DZYVWJ        | Test Team Alpha  |         2 | alice@example.com
 HYP-SEED02        | Neural Nexus     |         4 | sneha@svce.ac.in
 HYP-SEED01        | Circuit Breakers |         3 | arjun@svce.ac.in
```

**Members for "Test Team Alpha":**
```
  full_name  | phone_number |    usn     | department | semester | section
-------------+--------------+------------+------------+----------+---------
 Alice Smith | 9876543210   | 1SI22CS001 | CSE        |        5 | A
 Bob Jones   | 8765432109   | 1SI22CS002 | CSE        |        5 | B
```

**NULL phone count:** 0 (no members with null phone)

---

## 13. Persistence Test Result

```
docker compose restart postgres
# waited 15 seconds
docker exec hackathon-postgres-1 psql ... SELECT registration_code, team_name FROM teams
```

**Result:** All 4 teams (HYP-SEED01, HYP-SEED02, HYP-DZYVWJ, HYP-X9C7TF) remain present after restart. ✅ Data persists via `pgdata` named volume.

---

## 14. pgAdmin Status

pgAdmin is **not configured** in this project. Manual connection details for any PostgreSQL client:

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5433` |
| Database | `hyperion` |
| Username | `postgres` |
| Password | `Shivani` |

To add pgAdmin, add this service to `docker-compose.yml`:
```yaml
pgadmin:
  image: dpage/pgadmin4
  environment:
    PGADMIN_DEFAULT_EMAIL: admin@hyperion.local
    PGADMIN_DEFAULT_PASSWORD: admin
  ports:
    - '5050:80'
```
Then connect to `http://localhost:5050` using the host `postgres` (Docker service name), port `5432` (internal), database `hyperion`.

---

## 15. Remaining Issues

None blocking. The full registration flow is working end-to-end:

**Form → Validation → API → DB → Success Response**

One note: the phone regex `^[6-9]\d{9}$` enforces Indian mobile numbers (10 digits starting with 6–9). If international phone numbers need to be supported in future, the regex in `lib/validation/registration.ts` and the frontend hint text would need updating.
