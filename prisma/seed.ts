import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('senha123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ellp.dev' },
    update: {},
    create: {
      name: 'Admin ELLP',
      email: 'admin@ellp.dev',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const professor = await prisma.user.upsert({
    where: { email: 'professor@ellp.dev' },
    update: {},
    create: {
      name: 'Professor ELLP',
      email: 'professor@ellp.dev',
      password: passwordHash,
      role: 'PROFESSOR',
    },
  });

  await prisma.user.upsert({
    where: { email: 'tutor@ellp.dev' },
    update: {},
    create: {
      name: 'Tutor ELLP',
      email: 'tutor@ellp.dev',
      password: passwordHash,
      role: 'TUTOR',
    },
  });

  const theme = await prisma.theme.upsert({
    where: { slug: 'introducao-ao-scratch' },
    update: {},
    create: {
      name: 'Introdução ao Scratch',
      slug: 'introducao-ao-scratch',
      description: 'Oficina introdutória de programação visual com Scratch.',
    },
  });

  const existingWorkshop = await prisma.workshop.findFirst({
    where: { title: 'Oficina de Scratch — Turma A', date: new Date('2026-06-01T09:00:00Z') },
  });

  if (!existingWorkshop) {
    await prisma.workshop.create({
      data: {
        title: 'Oficina de Scratch — Turma A',
        date: new Date('2026-06-01T09:00:00Z'),
        location: 'Lab de Informática — UTFPR Cornélio Procópio',
        themeId: theme.id,
        professorId: professor.id,
      },
    });
  }

  console.log('Seed concluído:', { admin: admin.email, professor: professor.email, theme: theme.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
