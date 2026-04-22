/**
 * Session Memory (Redis abstraction)
 * Handles volatile conversation state with TTL
 */

interface SessionState {
  patientId?: string;
  context: any;
  history: { role: 'user' | 'agent', content: string }[];
  expiresAt: number;
}

const sessions = new Map<string, SessionState>();
const TTL = 30 * 60 * 1000; // 30 minutes

export const SessionMemory = {
  get: (sessionId: string): SessionState => {
    const session = sessions.get(sessionId);
    if (session && session.expiresAt > Date.now()) {
      return session;
    }
    // New session
    const newSession: SessionState = {
      context: {},
      history: [],
      expiresAt: Date.now() + TTL
    };
    sessions.set(sessionId, newSession);
    return newSession;
  },

  update: (sessionId: string, updates: Partial<SessionState>) => {
    const current = SessionMemory.get(sessionId);
    sessions.set(sessionId, {
      ...current,
      ...updates,
      expiresAt: Date.now() + TTL // Sliding expiration
    });
  },

  addMessage: (sessionId: string, role: 'user' | 'agent', content: string) => {
    const session = SessionMemory.get(sessionId);
    session.history.push({ role, content });
    // Limit history to last 10 turns
    if (session.history.length > 20) {
      session.history.shift();
    }
    SessionMemory.update(sessionId, { history: session.history });
  },

  clear: (sessionId: string) => {
    sessions.delete(sessionId);
  }
};

// Background cleanup
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(id);
    }
  }
}, 60000);
