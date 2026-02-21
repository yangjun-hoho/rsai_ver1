const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args: unknown[]) => { if (isDev) console.debug(...args); },
  info: (...args: unknown[]) => { if (isDev) console.info(...args); },
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
  devOnly: (fn: () => void) => { if (isDev) fn(); },
  perf: {
    start: (label: string) => { if (isDev) console.time(label); },
    end: (label: string) => { if (isDev) console.timeEnd(label); },
  },
};

export const logUtils = {
  summarize: (obj: Record<string, unknown>, keys: string[]) => {
    return keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {});
  },
  getArrayInfo: (arr: unknown[]) => ({ length: arr?.length ?? 0 }),
};
