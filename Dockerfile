FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js with standalone output
ENV R2_ACCOUNT_ID=build_placeholder
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output for smaller image size
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy node_modules for Payload CLI (needed for migrations)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy scripts and source for migrations
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

USER nextjs




ENV HOSTNAME="0.0.0.0"

# Health check for Cloud Run
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Labels for better image management
LABEL org.opencontainers.image.title="Zoi CMS - Payload CMS"
LABEL org.opencontainers.image.description="Payload CMS for Zoi Platform"
LABEL org.opencontainers.image.vendor="Nuat Labs"

# Run migrations before starting the server
# This ensures that the database schema is up to date with the code
# We use ; instead of && to ensure the server starts even if migrations log a warning or have a minor issue, 
# though fatal migration errors should still be addressed.
# Run migrations before starting the server.
# Using '|| true' ensures that even if migrations report an error (like a locked table 
# or a partial failure), the server will still attempt to start and listen on the port, 
# preventing Cloud Run from killing the instance immediately.
CMD ["sh", "-c", "echo \"[STARTUP] Initializing Payload CMS on port ${PORT:-8080}...\" && (npm run migrate || echo \"[WARNING] Migrations encountered an issue, check logs. Continuing startup...\") && echo \"[STARTUP] Starting Next.js server...\" && PORT=${PORT:-8080} node server.js"]
