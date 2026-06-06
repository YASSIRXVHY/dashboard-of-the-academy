import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function seed() {
  try {
    const count = await db.admin.count();
    if (count > 0) {
      console.log('Admin already exists. Skipping seed.');
      console.log('To reset, delete the database file and run "npx prisma db push" first.');
      return;
    }

    const hashedPassword = await bcrypt.hash('xvhy20015', 10);

    const admin = await db.admin.create({
      data: {
        username: 'yassir',
        password: hashedPassword,
        name: 'Yassir',
      },
    });

    console.log('✓ Admin created successfully!');
    console.log('  Username: yassir');
    console.log('  Password: xvhy20015');
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

seed();
