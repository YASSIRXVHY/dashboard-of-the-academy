import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword, generateToken, storeToken, removeToken, validateToken } from '@/lib/auth';

// Default admin credentials (used only on first setup)
const DEFAULT_ADMIN = {
  username: 'yassir',
  password: 'xvhy20015',
  name: 'Yassir',
};

// Ensure admin exists — creates one if the database is empty
async function ensureAdminExists() {
  const count = await db.admin.count();
  if (count === 0) {
    const hashedPassword = await hashPassword(DEFAULT_ADMIN.password);
    await db.admin.create({
      data: {
        username: DEFAULT_ADMIN.username,
        password: hashedPassword,
        name: DEFAULT_ADMIN.name,
      },
    });
    console.log('[Auth] Default admin created:', DEFAULT_ADMIN.username);
  }
}

// POST /api/auth — login
export async function POST(request: NextRequest) {
  try {
    // Make sure there's an admin user
    try { await ensureAdminExists(); } catch(e) {}

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Hardcoded bypass for Vercel
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      const token = await generateToken('admin-1');
      return NextResponse.json({
        token,
        admin: {
          id: 'admin-1',
          name: DEFAULT_ADMIN.name,
          username: DEFAULT_ADMIN.username,
        },
      });
    }

    const admin = await db.admin.findUnique({ where: { username } });
    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, admin.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await generateToken(admin.id);
    storeToken(token, admin.id);

    return NextResponse.json({
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/auth/session
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await validateToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Hardcoded bypass for Vercel
    if (session.adminId === 'admin-1') {
      return NextResponse.json({
        admin: {
          id: 'admin-1',
          name: DEFAULT_ADMIN.name,
          username: DEFAULT_ADMIN.username,
        }
      });
    }

    const admin = await db.admin.findUnique({
      where: { id: session.adminId },
      select: { id: true, name: true, username: true },
    });

    if (!admin) {
      removeToken(token);
      return NextResponse.json({ error: 'Admin not found' }, { status: 401 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/auth/logout
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (token) {
      removeToken(token);
    }

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
