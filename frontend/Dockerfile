FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN --mount=type=secret,id=npmrc,target=/app/.npmrc npm ci

COPY . .

EXPOSE 4200

CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "4200"]
