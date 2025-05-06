FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy client build
COPY --from=builder /app/dist/public ./dist/public

# Copy server build
COPY --from=builder /app/dist/server/server.mjs ./server.mjs

# Copy dependencies dan env
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env .env

ENV NODE_ENV=production
EXPOSE 5010

CMD ["node", "--experimental-vm-modules", "server.mjs"]