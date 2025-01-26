import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('Ailoh7373!', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'ali@janusny.com',
        password: hashedPassword,
        name: 'Ali Mirza',
        role: 'ADMIN',
        isActive: true,
        paymentStatus: 'FREE'
      }
    });
    
    console.log('Admin user created successfully:', admin);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 