import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/lib/auth';

export async function authenticateRequest(request: NextRequest): Promise<NextResponse | null> {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }
  const session = await validateToken(token);
  if (!session) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
  return null; // null means authentication passed
}
