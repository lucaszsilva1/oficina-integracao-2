-- AlterTable
ALTER TABLE "certificates" ALTER COLUMN "number" DROP DEFAULT,
ALTER COLUMN "number" SET DATA TYPE TEXT;
DROP SEQUENCE "certificates_number_seq";
