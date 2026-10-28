import { User } from '../types';

const SESSION_KEY = 'bny_auth_session_v4';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 menit

export interface SessionData {
  userId: string;
  token: string;
  loginAt: number;
  lastActivity: number;
}

export const AuthService = {
  /**
   * Generates a cryptographically strong random salt
   */
  generateSalt(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  },

  /**
   * Hashes a password with salt using the browser Web Crypto API (SHA-256)
   */
  async hashPassword(password: string, salt: string): Promise<string> {
    const enc = new TextEncoder();
    const data = enc.encode(`${salt}:${password}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Verifies an entered password against a stored SHA-256 hash and salt
   */
  async verifyPassword(password: string, storedHash?: string, salt?: string): Promise<boolean> {
    if (!storedHash || !salt) return false;
    const computed = await this.hashPassword(password, salt);
    return computed === storedHash;
  },

  /**
   * Start a new user session with inactivity tracking
   */
  startSession(user: User): SessionData {
    // Clear any leftover legacy lockout key
    try {
      localStorage.removeItem('bny_auth_lockout_v4');
    } catch {
      // ignore
    }

    const session: SessionData = {
      userId: user.id,
      token: `bny_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginAt: Date.now(),
      lastActivity: Date.now(),
    };
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      sessionStorage.setItem(SESSION_KEY, session.token);
    } catch (err) {
      console.error('Error saving session:', err);
    }
    return session;
  },

  /**
   * Update the user activity timestamp
   */
  touchSession(): void {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const session: SessionData = JSON.parse(raw);
      session.lastActivity = Date.now();
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  },

  /**
   * Validates active session: checks if user exists and hasn't been idle > 30 minutes
   */
  validateSession(): { isValid: boolean; user?: User; expired?: boolean } {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return { isValid: false };
      const session: SessionData = JSON.parse(raw);

      // Check inactivity (30 minutes)
      const idleTime = Date.now() - session.lastActivity;
      if (idleTime > INACTIVITY_TIMEOUT_MS) {
        this.terminateSession();
        return { isValid: false, expired: true };
      }

      // Check user exists and is active
      let user: User | undefined;
      const rawUsers = localStorage.getItem('bny_users_v2');
      if (rawUsers) {
        try {
          const list: User[] = JSON.parse(rawUsers);
          user = list.find((u) => u.id === session.userId);
        } catch {
          // ignore
        }
      }
      if (!user || !user.aktif) {
        this.terminateSession();
        return { isValid: false };
      }

      // Touch activity to keep alive
      this.touchSession();
      return { isValid: true, user };
    } catch {
      return { isValid: false };
    }
  },

  /**
   * Clear session on logout
   */
  terminateSession(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  },
};
