export type UserRole = 'admin' | 'user' | 'guest' | null;

export interface SessionData {
  token: string | null;
  role: UserRole;
}

/**
 * Parses cookies from request headers and extracts session data
 * @param cookieHeader - The raw cookie header string from the request
 * @returns SessionData object containing token and role
 */
export function getSessionFromCookies(cookieHeader: string | undefined): SessionData {
  if (!cookieHeader) {
    return { token: null, role: null };
  }

  const cookies = cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return {
    token: cookies['auth_token'] || null,
    role: (cookies['user_role'] as UserRole) || null,
  };
}

/**
 * Creates a cookie string for setting authentication data
 * @param token - The authentication token
 * @param role - The user role
 * @returns Formatted cookie string
 */
export function createAuthCookies(token: string, role: UserRole): string {
  const cookies = [
    `auth_token=${token}; Path=/; SameSite=Lax; Max-Age=86400`,
    `user_role=${role}; Path=/; SameSite=Lax; Max-Age=86400`,
  ];
  return cookies.join('; ');
}

/**
 * Clears authentication cookies
 * @returns Formatted cookie string to clear auth data
 */
export function clearAuthCookies(): string {
  const cookies = [
    'auth_token=; Path=/; SameSite=Lax; Max-Age=0',
    'user_role=; Path=/; SameSite=Lax; Max-Age=0',
  ];
  return cookies.join('; ');
} 