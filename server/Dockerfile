FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ openssl

COPY package*.json ./

RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "src/server.js"]