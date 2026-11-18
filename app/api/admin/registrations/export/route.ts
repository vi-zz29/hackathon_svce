/**
 * GET /api/admin/registrations/export
 * Downloads all registrations as a CSV.
 * Protected by ADMIN_TOKEN header.
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { env } from '@/lib/env'

function unauthorized() {
  return NextResponse.json(
    { ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or missing admin token.' } },
    { status: 401 },
  )
}

function escapeCsv(value: string | null | undefined | number | boolean): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

export async function GET(req: NextRequest) {
  if (req.headers.get('x-admin-token') !== env.ADMIN_TOKEN) return unauthorized()

  const teams = await db.team.findMany({
    orderBy: { createdAt: 'asc' },
    include: {
      members: { orderBy: [{ isLeader: 'desc' }, { createdAt: 'asc' }] },
    },
  })

  const rows: string[] = [
    // Header
    [
      'Registration Code',
      'Team Name',
      'Team Size',
      'Domain Interest',
      'Project Note',
      'Dietary Note',
      'Status',
      'Registered At',
      'Member 1 Name',
      'Member 1 Email',
      'Member 1 Phone',
      'Member 1 Dept',
      'Member 1 Semester',
      'Member 1 Section',
      'Member 1 USN',
      'Member 2 Name',
      'Member 2 Email',
      'Member 2 Phone',
      'Member 2 Dept',
      'Member 2 Semester',
      'Member 2 Section',
      'Member 2 USN',
      'Member 3 Name',
      'Member 3 Email',
      'Member 3 Phone',
      'Member 3 Dept',
      'Member 3 Semester',
      'Member 3 Section',
      'Member 3 USN',
      'Member 4 Name',
      'Member 4 Email',
      'Member 4 Phone',
      'Member 4 Dept',
      'Member 4 Semester',
      'Member 4 Section',
      'Member 4 USN',
    ]
      .map(escapeCsv)
      .join(','),
  ]

  for (const team of teams) {
    const cols = [
      team.registrationCode,
      team.teamName,
      team.teamSize,
      team.domainInterest,
      team.projectNote,
      team.dietaryNote,
      team.status,
      team.createdAt.toISOString(),
    ]
    for (let i = 0; i < 4; i++) {
      const m = team.members[i]
      cols.push(m?.fullName, m?.email, m?.phone, m?.department, m?.semester, m?.section, m?.usn)
    }
    rows.push(cols.map(escapeCsv).join(','))
  }

  const csv = rows.join('\r\n')
  const filename = `hyperion-registrations-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
