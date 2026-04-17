# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS dependencies
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM dependencies AS build
WORKDIR /app

COPY nest-cli.json tsconfig.json tsconfig.build.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN yarn build

FROM node:22-bookworm-slim AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=true \
	&& yarn cache clean

COPY prisma.config.ts ./
COPY prisma ./prisma
COPY --from=build /app/dist ./dist

USER node
EXPOSE 50051

CMD ["node", "dist/src/main.js"]
