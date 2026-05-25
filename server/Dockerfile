# ── Stage 1: install dependencies ─────────────────────────────────────────────
FROM oven/bun:1.2 AS install
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN bun install --frozen-lockfile

# ── Stage 2: production image ──────────────────────────────────────────────────
FROM oven/bun:1.2 AS release
WORKDIR /app

ENV NODE_ENV=production

# Copy installed node_modules from install stage
COPY --from=install /app/node_modules ./node_modules

# Copy the rest of the source
COPY . .

# Generate Prisma client (uses a dummy URL; real URL is injected at runtime)
RUN DATABASE_URL="mongodb://dummy:27017/dummy?replicaSet=rs0" bunx prisma generate

# Install Playwright's Chromium browser + system dependencies
RUN bunx playwright install --with-deps chromium

EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
