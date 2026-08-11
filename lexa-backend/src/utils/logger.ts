export const logger = {
  info: (msg: string, context: Record<string, unknown> = {}) => {
    console.log(JSON.stringify({ level: 'INFO', timestamp: new Date().toISOString(), message: msg, ...context }));
  },
  error: (msg: string, err?: unknown, context: Record<string, unknown> = {}) => {
    console.error(JSON.stringify({ level: 'ERROR', timestamp: new Date().toISOString(), message: msg, error: err instanceof Error ? err.message : String(err), ...context }));
  },
  metric: (name: string, value: number, tags: Record<string, string> = {}) => {
    console.log(JSON.stringify({ type: 'METRIC', name, value, tags, timestamp: new Date().toISOString() }));
  }
};
