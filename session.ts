import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';

const COOKIE_NAME = 'curbsense_demo_session';
const allowedUsers: Record<string, { id: string; name: string; permitStatus: 'none' | 'verified'; role: 'citizen' | 'admin' }> = {
  'citizen@curbsense.city': { id: 'citizen-ananya', name: 'Ananya Ramanathan', permitStatus: 'verified', role: 'citizen' },
  'suresh.k@gmail.com': { id: 'citizen-suresh', name: 'Suresh Kumar', permitStatus: 'none', role: 'citizen' },
  'karthik.traffic@ccmc.gov.in': { id: 'operator-karthik', name: 'Karthik Subramanian', permitStatus: 'none', role: 'admin' },
  'priya.mobility@ccmc.gov.in': { id: 'operator-priya', name: 'Priya Rajendran', permitStatus: 'none', role: 'admin' },
};

const DEV_FALLBACK_SECRET = 'curbsense-demo-development-secret';
const secret = () => {
  const configured = process.env.JWT_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === 'production') {
    // Refuse to sign sessions with a publicly-known fallback secret in production —
    // anyone reading this source could otherwise forge a valid session token
    // (including an admin one) for a deployment that forgot to set JWT_SECRET.
    throw new Error('JWT_SECRET must be set in production. Refusing to use the development fallback secret.');
  }
  return DEV_FALLBACK_SECRET;
};
const sign = (value: string) => createHmac('sha256', secret()).update(value).digest('base64url');

export type DemoSession = { userId: string; userName: string; email: string; permitStatus: 'none' | 'verified'; role: 'citizen' | 'admin' };

export function createDemoSession(email: string) {
  const normalized = email.trim().toLowerCase();
  const user = allowedUsers[normalized];
  if (!user) return null;
  const payload = Buffer.from(JSON.stringify({ ...user, email: normalized })).toString('base64url');
  const sessionUser: DemoSession = { userId: user.id, userName: user.name, email: normalized, permitStatus: user.permitStatus, role: user.role };
  const sessionPayload = Buffer.from(JSON.stringify(sessionUser)).toString('base64url');
  return { token: `${sessionPayload}.${sign(sessionPayload)}`, user: sessionUser };
}

export function setDemoSession(res: Response, token: string) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Secure`);
}

function parseCookie(header: string | undefined) {
  return header?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
}

export function readDemoSession(req: Request): DemoSession | null {
  const token = parseCookie(req.headers.cookie);
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as DemoSession;
    return allowedUsers[session.email] ? session : null;
  } catch {
    return null;
  }
}
