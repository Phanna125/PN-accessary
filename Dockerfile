FROM node:22.12.0-bookworm-slim AS build

WORKDIR /app

ARG BUILD_DATABASE_URL="mysql://build:build@127.0.0.1:3306/build"
ENV DATABASE_URL=${BUILD_DATABASE_URL}

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci --include=dev

COPY nest-cli.json ./
COPY tsconfig*.json ./
COPY src ./src

RUN npm run build
RUN npm prune --omit=dev

FROM node:22.12.0-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

CMD ["npm", "run", "start:prod"]
