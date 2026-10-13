import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';

const globalForPrisma = globalThis;

// Prisma's pg adapter normalizes timestamptz text as UTC. Require a UTC
// PostgreSQL session so inserted and returned instants keep their true offset.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, options: '-c TimeZone=UTC' });

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
