# 1. Base image
FROM node:18-alpine AS base
RUN apk update && apk upgrade --no-cache
# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# --- AJOUTEZ CECI ---
# Déclarez les arguments que vous voulez passer
ARG NEXT_PUBLIC_API_BASE_URL=http://build-placeholder
ARG NEXT_PUBLIC_MODE=TESTNET
# Transformez-les en variables d'environnement pour le build
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_MODE=$NEXT_PUBLIC_MODE
# On désactive la télémétrie Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# 4. Runner (Production image)
# HMAC_SECRET must be provided at runtime (e.g. docker run -e HMAC_SECRET=...).
# Do NOT add ARG/ENV NEXT_PUBLIC_HMAC_SECRET or bake the secret into the image.
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# On copie uniquement le dossier standalone généré (très léger)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
CMD ["node", "server.js"]