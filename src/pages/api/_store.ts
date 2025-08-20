// Shared in-memory store for sessions across API routes
export type FileEntry = { content: string; type: string };
export type FileTree = Record<string, FileEntry>;
export type SessionStore = Record<string, FileTree>;

// Ensure a single instance across hot reloads
const globalAny = global as unknown as { __AIWB_SESSIONS__?: SessionStore };
if (!globalAny.__AIWB_SESSIONS__) {
	globalAny.__AIWB_SESSIONS__ = {};
}

export const sessions: SessionStore = globalAny.__AIWB_SESSIONS__!;

