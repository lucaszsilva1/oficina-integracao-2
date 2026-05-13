-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PROFESSOR', 'TUTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "themes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workshops" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "themeId" TEXT NOT NULL,
    "professorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "age" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TutorWorkshops" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "themes_slug_key" ON "themes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_workshopId_studentId_key" ON "attendances"("workshopId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_attendanceId_key" ON "certificates"("attendanceId");

-- CreateIndex
CREATE UNIQUE INDEX "certificates_number_key" ON "certificates"("number");

-- CreateIndex
CREATE UNIQUE INDEX "_TutorWorkshops_AB_unique" ON "_TutorWorkshops"("A", "B");

-- CreateIndex
CREATE INDEX "_TutorWorkshops_B_index" ON "_TutorWorkshops"("B");

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_themeId_fkey" FOREIGN KEY ("themeId") REFERENCES "themes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorWorkshops" ADD CONSTRAINT "_TutorWorkshops_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TutorWorkshops" ADD CONSTRAINT "_TutorWorkshops_B_fkey" FOREIGN KEY ("B") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
