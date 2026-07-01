FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies with bun
RUN npm install -g bun && bun install

# Copy source
COPY . .

# Build
RUN bun run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm for lightweight production server
RUN npm install -g pnpm

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Install production dependencies only
RUN pnpm install --prod

# Expose port
EXPOSE 3000

# Start server
CMD ["pnpm", "preview"]
