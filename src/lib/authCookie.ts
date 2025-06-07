import { NextRequest } from 'next/server';

// Define a TypeScript interface representing the shape of a user session
export interface Session {
  auth_token: string | null;  // Token used for authenticating the user
  user_role: string | null;   // Role assigned to the user (admin, user, guest)
}

export function getSessionFromCookies(request: NextRequest): Session {
  const cookieHeader = request.headers.get('cookie') || '';

  // Parse the cookie header into a key-value map
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value; 
    return acc;
  }, {} as Record<string, string>); 

  return {
    auth_token: cookies['auth_token'] || null,
    user_role: cookies['user_role'] || null,
  };
}
