# Stage 1: Build the application
FROM node:24-alpine AS build

ENV DATABASE_URL=data/coursebooker.db
ENV NODE_ENV=production

RUN apk update && apk add git

# Install bun
RUN npm install -g bun

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./package*.json ./
COPY ./bun.lock ./

# Install dependencies using bun
RUN bun ci
RUN bun add @libsql/linux-x64-musl

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun x nuxi prepare
RUN bun x nuxi build

FROM node:24-alpine

ENV DATABASE_URL=data/coursebooker.db
ENV TZ=Europe/Zurich

RUN apk update && apk add git

# Install tzdata and set timezone
RUN apk add --no-cache tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/local

COPY --from=build /app/.output ./
# Copy native libsql module from build stage (required at runtime, can't be bundled by Nitro)
COPY --from=build /app/node_modules/@libsql/linux-x64-musl ./server/node_modules/@libsql/linux-x64-musl
COPY .env*.schema /
COPY  drizzle ./drizzle

COPY --from=ghcr.io/dmno-dev/varlock:latest --chown=node:node /usr/local/bin/varlock /usr/local/bin/varlock

# Expose the port the app runs on
EXPOSE 3000

# Start the application
ENTRYPOINT ["varlock", "run", "--", "node", "server/index.mjs"]
