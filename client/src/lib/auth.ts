'use server';

import { cookies } from 'next/headers';
import type { Role } from '@/types/auth';

/**
 * Server Action to securely set cookie sessions
 * This ensures the token is HttpOnly and cannot be accessed by client-side JS (XSS protected)
 */
export async function setSession(token: string, role: Role) {
  const cookieStore = await cookies();
  
  // Set the token
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    // Set an appropriate expiration, e.g., 7 days
    maxAge: 60 * 60 * 24 * 7,
  });

  // Set the role (can be accessed by middleware easily)
  cookieStore.set('role', role, {
    httpOnly: true, // Also secure 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

/**
 * Server Action to securely clear cookie sessions
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('role');
}

/**
 * Utility to grab token on server-side functions (like Server Components)
 */
export async function getServerSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get('token')?.value;
}
