# Stage 1: Build React Frontend for kannadavedike.nitk.ac.in
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_URL=https://kannadavedike.nitk.ac.in/api
RUN npm run build

# Stage 2: Production Container
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache python3 make g++ openssl
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server ./server
COPY --from=frontend-builder /app/build ./build

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server/src/server.js"]