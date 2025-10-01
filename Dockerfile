# Stage 1: Build the application
FROM node:22-alpine3.21 AS build

# Set working directory
WORKDIR /app

# Install bun
# RUN npm install -g bun

# Copy package.json and package-lock.json
COPY ./package*.json ./
COPY .npmrc ./
# COPY ./bun.lock ./

# Install dependencies using bun
RUN npm ci
RUN npm add @libsql/linux-x64-musl

# Install dependencies using npm (for packages not supported by bun)
# RUN npm install
# RUN npm install @libsql/linux-x64-musl

# Copy the rest of the application code
COPY . .

# Build the application
# RUN npm run prepare
RUN npm run build

# Stage 2: Run the application
FROM node:22-alpine3.21 AS runtime

# Set working directory
WORKDIR /app

# Copy the built application from the build stage
COPY --from=build /app/.output ./

COPY ./drizzle ./drizzle
COPY ./drizzle.config.ts ./drizzle.config.ts
COPY --from=build /app/node_modules/@libsql/linux-x64-musl ./server/node_modules/@libsql/linux-x64-musl

# Expose the port the app runs on
EXPOSE 3000

# Start the application
ENTRYPOINT ["node", "server/index.mjs"]