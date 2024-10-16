FROM node:lts-alpine

RUN adduser -S appuser

USER appuser

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm run test

EXPOSE 8080
CMD ["npm", "start"]