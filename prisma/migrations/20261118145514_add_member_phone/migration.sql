-- CreateEnum
CREATE TYPE "TeamStatus" AS ENUM ('pending', 'confirmed', 'waitlisted', 'cancelled');

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "registration_code" TEXT NOT NULL,
    "team_name" TEXT NOT NULL,
    "team_size" INTEGER NOT NULL,
    "contact_email" TEXT NOT NULL,
    "domain_interest" TEXT,
    "project_note" TEXT,
    "dietary_note" TEXT,
    "consent_accepted_at" TIMESTAMP(3) NOT NULL,
    "status" "TeamStatus" NOT NULL DEFAULT 'confirmed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "is_leader" BOOLEAN NOT NULL DEFAULT false,
    "full_name" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "usn" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_events" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_registration_code_key" ON "teams"("registration_code");

-- CreateIndex
CREATE INDEX "teams_created_at_idx" ON "teams"("created_at");

-- CreateIndex
CREATE INDEX "members_team_id_idx" ON "members"("team_id");

-- CreateIndex
CREATE UNIQUE INDEX "members_email_key" ON "members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "members_usn_key" ON "members"("usn");

-- CreateIndex
CREATE INDEX "registration_events_team_id_idx" ON "registration_events"("team_id");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_events" ADD CONSTRAINT "registration_events_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
