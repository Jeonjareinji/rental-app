FROM node:18-alpine

WORKDIR /app

# Copy package files dulu buat install deps
COPY package*.json ./

# Install deps pake npm ci (lebih aman & cepat buat production)
RUN npm ci

# Copy hasil build lokal
COPY dist ./dist

# Copy public assets dari hasil build client
COPY client/dist/public ./dist/public

ENV PORT=5000 \
    HOST=0.0.0.0 \
    NODE_ENV=production

EXPOSE 5000
CMD ["node", "--experimental-vm-modules", "dist/server.mjs"]
