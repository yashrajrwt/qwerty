export const AUTH_LIMITS = {
  login: 20,
  register: 10,
  forgot: 8,
  reset: 8,
  verify: 12,
  email_change: 5,
  delete: 5,
} as const;

export type AuthAction = keyof typeof AUTH_LIMITS;

export const AUTH_WINDOW_MS = 15 * 60 * 1000;

export function rateLimited(count: number, action: AuthAction) {
  return count >= AUTH_LIMITS[action];
}
