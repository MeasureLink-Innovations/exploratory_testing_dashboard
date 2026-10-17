FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc npm ci

COPY . .

RUN NODE_TLS_REJECT_UNAUTHORIZED=0 npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "start"]
