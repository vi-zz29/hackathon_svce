# Fixes Report

## Fix 1 — Date wording correction

**Files changed:** `lib/site-config.ts`, `app/register/page.tsx`

- `lib/site-config.ts`: renamed field `registrationDateLabel` → `hackathonDate`. Updated JSDoc to read: "Human-readable hackathon event date shown as a badge on the registration page, e.g. '30th November'." Value kept as `'30th November'`.
- `app/register/page.tsx`: changed badge text from `Registration opens: {siteConfig.registrationDateLabel ...}` to `Hackathon Date: {siteConfig.hackathonDate ...}`.

**What the page now shows:** `Hackathon Date: 30th November`

No registration opening date is invented or displayed. The separate `registrationOpensAt` field (which gates whether the form is live) is unchanged.

No other files referenced `registrationDateLabel` in components or app routes — only `.agents/tasks/` documents (plan/report notes) which are not code.

---

## Fix 2 — PostgreSQL CHECK constraint on `teams.team_size`

**Migration created:** `prisma/migrations/20261118160000_add_team_size_check/migration.sql`

```sql
-- Add CHECK constraint: team_size must be between 2 and 4 (inclusive)
ALTER TABLE "teams" ADD CONSTRAINT "teams_team_size_check" CHECK (team_size >= 2 AND team_size <= 4);
```

**Migration applied:** `pnpm prisma migrate deploy` — applied cleanly as `20261118160000_add_team_size_check`.

**Verification results:**

| Test | Result |
|------|--------|
| `\d teams` shows `teams_team_size_check` | ✅ PASS |
| `team_size = 1` INSERT rejected | ✅ PASS — `violates check constraint "teams_team_size_check"` |
| `team_size = 5` INSERT rejected | ✅ PASS — `violates check constraint "teams_team_size_check"` |
| `team_size = 2` INSERT accepted, then deleted | ✅ PASS — `INSERT 0 1` / `DELETE 1` |

Existing Zod validation (`teamSize` min:2 max:4 in `lib/validation/registration.ts`) is unchanged. The DB constraint is an additional safety layer.

---

## Fix 3 — Phone number in `getRegistrationSummary`

**File changed:** `lib/services/registration.service.ts`

Added `phone: true` to the `members: { select: { ... } }` block in `getRegistrationSummary`. The Prisma field `phone` maps to the `phone_number` column.

The `createMany` path already included `phone: m.phone` — no change needed there.

The admin route (`app/api/admin/registrations/route.ts`) uses `include: { members: true }` (all columns), so phone was already returned there — no change needed.

**Verification:**

- `SELECT full_name, phone_number, usn FROM members LIMIT 5` — phone_number column present with data (e.g. `9876543210`).
- `GET /api/register/HYP-WZQP6F` returns `members[].phone` for each member (confirmed `9876543210`, `9876543211` for regression test team).

---

## Regression test

**POST /api/register** with a 2-member team (`VerifyTeamFix99`, members `VFXTEST99A`/`VFXTEST99B`):

- Response: `ok: true`, `registrationId: HYP-WZQP6F` ✅
- Phone numbers stored in DB: verified via direct psql query ✅
- Phone returned by `getRegistrationSummary`: verified via GET API ✅
- Build: `pnpm build` compiled cleanly with no errors ✅

---

## Migration naming note (cosmetic only)

The existing migration `20261118145514_add_member_phone` created the full initial schema (teams, members, registration_events tables), not just the phone field. This naming is misleading but the migration is already applied to the database. Per instructions, it was left untouched — modifying applied migration history would be destructive. This is a cosmetic issue only.

---

## Docker / database persistence

The PostgreSQL Docker container (`hackathon-postgres-1`, port 5433, database `hyperion`) was used throughout. No data was destroyed. The existing volume continues to persist data (pre-existing seed rows and registered teams remain intact).

---

## Remaining issues

None. All three fixes are implemented, verified, and committed.
