FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
# Adicionamos a flag --skipLibCheck true para ignorar erros em declarações de terceiros
RUN npx -p typescript tsc src/*.ts --outDir dist --target es2022 --module commonjs --skipLibCheck true

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]