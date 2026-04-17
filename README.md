# Auth Service

Authentication microservice for the cinema service backend. It exposes a gRPC server and uses PostgreSQL through Prisma plus Redis for OTP/session-related flows.

## Requirements

- Node.js 20+ for local development.
- Yarn 1.x.
- PostgreSQL.
- Redis.
- Docker, when building the production image.

## Local development

Install dependencies:

```bash
yarn install
```

Run in watch mode:

```bash
yarn start:dev
```

Required local environment variables:

```text
GRPC_HOST=0.0.0.0
GRPC_PORT=50051

DB_HOST=localhost
DB_PORT=5433
DB_USER=cinema_local
DB_PASSWORD=cinema_local_password
DB_DATABASE=cinema_auth
DB_URI=postgresql://cinema_local:cinema_local_password@localhost:5433/cinema_auth

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=cinema_local_redis_password
```

Local PostgreSQL and Redis can be started from the backend root with:

```bash
docker compose \
  -f docker/compose.base.yaml \
  -f docker/compose.local.yaml \
  --env-file docker/env/local.env \
  up -d
```

## Build and run

Compile TypeScript:

```bash
yarn build
```

Run the compiled app:

```bash
node dist/src/main.js
```

The compiled entrypoint is `dist/src/main.js`.

## Tests

```bash
yarn test
yarn test:e2e
yarn test:cov
```

## Docker image

The production Dockerfile is [Dockerfile](./Dockerfile). It uses a multi-stage build:

- installs dependencies with `yarn install --frozen-lockfile`;
- compiles the Nest app and checked-in Prisma generated client;
- installs production dependencies only in the runtime image;
- runs as the non-root `node` user;
- starts with `node dist/src/main.js`.

Build the image from the backend root:

```bash
docker build -t ghcr.io/your-org/cinema-auth-service:latest -f auth-service/Dockerfile auth-service
```

Run locally with PostgreSQL and Redis available on the host:

```bash
docker run --rm \
  -p 50051:50051 \
  -e GRPC_HOST=0.0.0.0 \
  -e GRPC_PORT=50051 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=5433 \
  -e DB_USER=cinema_local \
  -e DB_PASSWORD=cinema_local_password \
  -e DB_DATABASE=cinema_auth \
  -e DB_URI=postgresql://cinema_local:cinema_local_password@host.docker.internal:5433/cinema_auth \
  -e REDIS_HOST=host.docker.internal \
  -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=cinema_local_redis_password \
  ghcr.io/your-org/cinema-auth-service:latest
```

## Compose deployment

The Docker Compose production files live in `../docker`:

- `docker/compose.prod.yaml` runs this service from `AUTH_SERVICE_IMAGE`.
- `docker/compose.prod.infra.yaml` adds containerized PostgreSQL and Redis.
- `docker/compose.prod.aws-managed.yaml` uses RDS PostgreSQL and ElastiCache or another Redis-compatible managed service.

Set the image in `docker/env/prod.env`:

```text
AUTH_SERVICE_IMAGE=ghcr.io/your-org/cinema-auth-service:latest
```

For the containerized infrastructure mode, service discovery uses Docker service names:

```text
DB_HOST=postgresql
REDIS_HOST=redis
```
