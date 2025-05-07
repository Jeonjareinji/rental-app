FROM node:18-alpine

# Buat direktori kerja
WORKDIR /app

# Salin env dulu supaya cache lebih stabil
COPY ./.env ./.env

# Salin dist backend (hasil build server)
COPY ./dist ./dist

# Salin public client build ke dalam dist/public
COPY ./client/dist/public ./dist/public

# Salin dependency list dan install
COPY package*.json ./
RUN npm install --production

# Set environment variables
ENV PORT=5000 \
    HOST=0.0.0.0 \
    NODE_ENV=production

# Expose port
EXPOSE 5000

# Jalankan backend
CMD ["node", "--experimental-vm-modules", "dist/server.mjs"]
