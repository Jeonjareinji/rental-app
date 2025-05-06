FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy hasil build client (dari Vite)
COPY --from=builder /app/dist/public ./dist/public

# Copy hasil build server (dari esbuild)
COPY --from=builder /app/dist/server/server.mjs ./dist/server.mjs

# Copy dependencies dan env
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env .env

CMD ["node", "--experimental-vm-modules", "dist/server.mjs"]