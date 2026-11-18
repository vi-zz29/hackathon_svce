/**
 * Seed script — populates the DB with sample data for local dev.
 * Run:  pnpm db:seed
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🌱  Seeding database…')

  // Clear existing data (dev only)
  await db.registrationEvent.deleteMany()
  await db.member.deleteMany()
  await db.team.deleteMany()

  const teams = [
    {
      registrationCode: 'HYP-SEED01',
      teamName: 'Circuit Breakers',
      teamSize: 3,
      contactEmail: 'arjun@svce.ac.in',
      domainInterest: 'Electronics',
      projectNote: 'Smart traffic management using IoT sensors.',
      status: 'confirmed' as const,
      members: [
        { fullName: 'Arjun Kumar', email: 'arjun@svce.ac.in', phone: '9876543210', department: 'Electronics', semester: 5, section: 'A', usn: 'SVCE21EC001', isLeader: true },
        { fullName: 'Priya Sharma', email: 'priya@svce.ac.in', phone: '9876543211', department: 'Computer Science', semester: 3, section: 'B', usn: 'SVCE22CS045', isLeader: false },
        { fullName: 'Ravi Verma', email: 'ravi@svce.ac.in', phone: '9876543212', department: 'Mechanical', semester: 5, section: 'A', usn: 'SVCE21ME022', isLeader: false },
      ],
    },
    {
      registrationCode: 'HYP-SEED02',
      teamName: 'Neural Nexus',
      teamSize: 4,
      contactEmail: 'sneha@svce.ac.in',
      domainInterest: 'Artificial Intelligence',
      projectNote: 'AI-powered crop disease detection using mobile cameras.',
      status: 'confirmed' as const,
      members: [
        { fullName: 'Sneha Reddy', email: 'sneha@svce.ac.in', phone: '9876543220', department: 'Computer Science', semester: 7, section: 'A', usn: 'SVCE20CS011', isLeader: true },
        { fullName: 'Aditya Nair', email: 'aditya@svce.ac.in', phone: '9876543221', department: 'Computer Science', semester: 7, section: 'B', usn: 'SVCE20CS012', isLeader: false },
        { fullName: 'Kavya Pillai', email: 'kavya@svce.ac.in', phone: '9876543222', department: 'Electronics', semester: 5, section: 'A', usn: 'SVCE21EC033', isLeader: false },
        { fullName: 'Deepak Raj', email: 'deepak@svce.ac.in', phone: '9876543223', department: 'Electrical', semester: 5, section: 'C', usn: 'SVCE21EE007', isLeader: false },
      ],
    },
  ]

  for (const { members, ...teamData } of teams) {
    const team = await db.team.create({
      data: {
        ...teamData,
        consentAcceptedAt: new Date(),
      },
    })

    await db.member.createMany({
      data: members.map((m) => ({ ...m, teamId: team.id })),
    })

    await db.registrationEvent.create({
      data: { teamId: team.id, type: 'created', metadata: { seeded: true } },
    })

    console.log(`  ✅  ${team.teamName} (${team.registrationCode})`)
  }

  console.log('✨  Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
