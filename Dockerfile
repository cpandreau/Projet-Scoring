# ============================================
# Dockerfile - Production Build (Multi-Stage)
# Synadose - Next.js 16 Application
# Full Bun runtime for maximum performance
# ============================================

# ===========================================
# Stage 1: Dependencies - Install with Bun
# ===========================================
FROM oven/bun:alpine AS deps

WORKDIR /app

# Copy package files for dependency installation
COPY package.json bun.lock ./

# Install dependencies with Bun
# --frozen-lockfile ensures reproducible builds
RUN bun install --frozen-lockfile --ignore-scripts

# ===========================================
# Stage 2: Builder - Build with Bun
# ===========================================
FROM oven/bun:alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# -----------------------------------------------
# Build-time arguments (ARG) - For Dokploy
# These are ONLY available during build, not runtime
# -----------------------------------------------
# Public variables (embedded in client bundle)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# Set environment variables for Next.js build
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application with Bun runtime
RUN bun --bun run next build

# ===========================================
# Stage 3: Runner - Production runtime with Bun
# ===========================================
FROM oven/bun:alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install curl for healthcheck and create non-root user
# The 'bun' group already exists in oven/bun:alpine, reuse it
RUN apk add --no-cache curl \
    && apk upgrade --no-cache \
    && adduser --system --uid 1001 --ingroup bun nextjs

# Copy built assets from builder stage
# Public folder for static assets
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:bun .next

# Copy standalone output (requires output: 'standalone' in next.config)
COPY --from=builder --chown=nextjs:bun /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bun /app/.next/static ./.next/static

# Switch to non-root user for security
USER nextjs

# Expose the port Next.js runs on
EXPOSE 3000

# Set hostname for proper container networking
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health check for container orchestration
# Using curl: ~5ms per check
HEALTHCHECK --interval=60s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application with Bun runtime
CMD ["bun", "server.js"]
