// ANSI Color Codes
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",

  // Foreground colors
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    gray: "\x1b[90m",
  },

  // Background colors
  bg: {
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
  },
};

// Utility function to format time with style
const getStyledTime = () => {
  const now = new Date();
  const time = now.toISOString().split("T")[1].slice(0, 8);
  return `${colors.fg.gray}${time}${colors.reset}`;
};

// Utility function to create styled badges
const createBadge = (
  text: string,
  bgColor: string,
  fgColor: string = colors.fg.white,
) => {
  return `${colors.bright}${bgColor}${fgColor} ${text} ${colors.reset}`;
};

// Utility function to format data
const formatData = (args: any[]) => {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === "object") {
        return JSON.stringify(arg, null, 2);
      }
      return arg;
    })
    .join(" ");
};

export const logger = {
  info: (message: string, ...args: any[]) => {
    const badge = createBadge("ℹ INFO", colors.bg.blue);
    const time = getStyledTime();
    const msg = `${colors.fg.cyan}${message}${colors.reset}`;
    const data = args.length
      ? `\n  ${colors.fg.gray}${formatData(args)}${colors.reset}`
      : "";

    console.log(`${badge} ${time} ${msg}${data}`);
  },

  warn: (message: string, ...args: any[]) => {
    const badge = createBadge("⚠ WARN", colors.bg.yellow, colors.fg.black);
    const time = getStyledTime();
    const msg = `${colors.fg.yellow}${message}${colors.reset}`;
    const data = args.length
      ? `\n  ${colors.fg.gray}${formatData(args)}${colors.reset}`
      : "";

    console.warn(`${badge} ${time} ${msg}${data}`);
  },

  error: (message: string, ...args: any[]) => {
    const badge = createBadge("✕ ERROR", colors.bg.red);
    const time = getStyledTime();
    const msg = `${colors.bright}${colors.fg.red}${message}${colors.reset}`;
    const data = args.length
      ? `\n  ${colors.fg.gray}${formatData(args)}${colors.reset}`
      : "";

    console.error(`${badge} ${time} ${msg}${data}`);
  },

  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== "production") {
      const badge = createBadge("🐛 DEBUG", colors.bg.magenta);
      const time = getStyledTime();
      const msg = `${colors.fg.magenta}${message}${colors.reset}`;
      const data = args.length
        ? `\n  ${colors.fg.gray}${formatData(args)}${colors.reset}`
        : "";

      console.log(`${badge} ${time} ${msg}${data}`);
    }
  },

  // Success logger
  success: (message: string, ...args: any[]) => {
    const badge = createBadge("✓ SUCCESS", colors.bg.green);
    const time = getStyledTime();
    const msg = `${colors.fg.green}${message}${colors.reset}`;
    const data = args.length
      ? `\n  ${colors.fg.gray}${formatData(args)}${colors.reset}`
      : "";

    console.log(`${badge} ${time} ${msg}${data}`);
  },

  // HTTP request logger
  http: (method: string, path: string, status: number, duration: number) => {
    const statusColor =
      status < 300
        ? colors.fg.green
        : status < 400
          ? colors.fg.yellow
          : colors.fg.red;
    const badge = createBadge("🌐 HTTP", colors.bg.cyan);
    const time = getStyledTime();
    const methodCol = `${colors.bright}${colors.fg.white}${method.padEnd(6)}${colors.reset}`;
    const pathCol = `${colors.fg.cyan}${path}${colors.reset}`;
    const statusCol = `${statusColor}${status}${colors.reset}`;
    const durationCol = `${colors.fg.gray}${duration}ms${colors.reset}`;

    console.log(
      `${badge} ${time} ${methodCol} ${pathCol} ${statusCol} ${durationCol}`,
    );
  },
};

// Example usage:
// logger.info('Server started', { port: 3000 });
// logger.warn('High memory usage detected', { memory: '512MB' });
// logger.error('Database connection failed', new Error('ECONNREFUSED'));
// logger.debug('User data', { id: 123, name: 'John' });
// logger.success('Migration completed successfully');
// logger.http('GET', '/api/users', 200, 45);
