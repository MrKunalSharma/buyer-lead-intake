import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getCurrentUser() {
  const cookieStore = await cookies();  // Add await here
  const userId = cookieStore.get('userId')?.value;
  
  if (!userId) {
    return null;
  }
  
  // TEMPORARY: Return a mock user for demo
  return {
    id: userId,
    email: 'demo@example.com',
    name: 'Demo User',
    createdAt: new Date()
  };
}

export async function loginUser(email: string) {
  // TEMPORARY: Return a mock user for demo
  const mockUser = {
    id: 'demo-user-123',
    email: email,
    name: email.split('@')[0],
    createdAt: new Date()
  };
  
  return mockUser;
}