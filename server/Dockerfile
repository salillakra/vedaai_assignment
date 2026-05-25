# Use the official Bun image
FROM oven/bun:1.1.27-slim as base
WORKDIR /app

ENV NODE_ENV=production

FROM base AS install
COPY package.json pnpm-lock.yaml* bun.lockb* ./
RUN bun install

FROM base AS release

# Set environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV NODE_ENV=$NODE_ENV
ENV REDIS_URL=$REDIS_URL
ENV JWT_SECRET=$JWT_SECRET
ENV PORT=$PORT
ENV GEMINI_API_KEY=$GEMINI_API_KEY
ENV S3_ENDPOINT=$S3_ENDPOINT
ENV S3_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID
ENV S3_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY
ENV S3_BUCKET_NAME=$S3_BUCKET_NAME

COPY --from=install /app/node_modules ./node_modules
COPY . .

RUN bunx prisma generate

# expose
EXPOSE 3000

#start the server
CMD ["bun", "run", "src/index.ts"]
