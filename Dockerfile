# syntax = docker/dockerfile:1

ARG BUN_VERSION=1.1.26
FROM oven/bun:${BUN_VERSION}-slim as base

LABEL fly_launch_runtime="Bun/Prisma"

WORKDIR /app

ENV NODE_ENV="production"

# Build stage
FROM base as build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential openssl pkg-config python-is-python3

COPY --link bun.lockb package.json ./
RUN bun install --ci

COPY --link prisma .
RUN bunx prisma generate

COPY --link . .

# Final stage
FROM base

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY --from=build /app /app

EXPOSE 3000

# Vercel uses `start` command by default
CMD [ "bun", "run", "start" ]