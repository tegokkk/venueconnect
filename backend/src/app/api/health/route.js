import { connection, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';

export async function GET() {
  try {
    await connection();
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      db: 'connected'
    });
  } catch {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      db: 'error'
    }, { status: 503 });
  }
}
