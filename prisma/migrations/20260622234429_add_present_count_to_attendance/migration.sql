-- AlterTable
ALTER TABLE "attendances" ADD COLUMN     "presentCount" INTEGER NOT NULL DEFAULT 0;

-- Backfill: presença PRESENT existente passa a contar frequência cheia (elegível ao certificado)
UPDATE "attendances" a
SET "presentCount" = w."totalClasses"
FROM "workshops" w
WHERE a."workshopId" = w."id" AND a."status" = 'PRESENT';
