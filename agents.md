# AGENTS.md — Production Guidelines (NestJS Microservices + Prisma)

## Purpose
Defines strict rules for AI agents generating or modifying code in a NestJS microservices architecture using Prisma ORM.

Goals:
- deterministic structure
- strict separation of concerns
- safe data access
- production-ready patterns

---

# 1. Architecture

## Stack
- NestJS (modular, DI-driven)
- Prisma (PostgreSQL)
- TypeScript (strict mode)
- Jest (unit tests)

---

## Project Structure

src/
  modules/
    <domain>/
      controllers/
      services/
      dto/
      mappers/
      __tests__/
  core/
    prisma/
      prisma.module.ts
      prisma.service.ts
    config/
    common/

---

# 2. Layer Responsibilities

## Controller (Transport Layer)
MUST:
- accept DTO
- validate input
- call service
- return response DTO

MUST NOT:
- contain business logic
- access Prisma
- transform DB entities

---

## Service (Business Logic)
MUST:
- implement all business rules
- orchestrate calls
- use PrismaService

MUST NOT:
- depend on HTTP layer
- return raw DB models

---

## Prisma (Data Layer)
- single entry point: PrismaService
- no direct usage outside services

---

## DTO Layer
- defines API contracts only
- must be independent from DB schema

---

## Mapper Layer
- converts Prisma models → DTOs
- isolates transformation logic

---

# 3. Prisma Rules

## PrismaService

@Injectable()
export class PrismaService extends PrismaClient {}

---

## Usage Pattern

constructor(private readonly prisma: PrismaService) {}

---

## Query Rules

MUST:
- use `select` explicitly
- limit data exposure

Example:

this.prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true
  }
});

---

## Transactions

MUST:
- use `$transaction` for multi-step writes

Example:

await this.prisma.$transaction([
  this.prisma.user.create(...),
  this.prisma.profile.create(...)
]);

---

## MUST NOT

- instantiate PrismaClient manually
- expose Prisma types outside service
- use `include` blindly (risk of overfetching)

---

# 4. DTO Rules

## Input DTO

export class CreateUserDto {
  email!: string;
  password!: string;
}

---

## Response DTO

export class UserResponseDto {
  id!: string;
  email!: string;
}

---

## Mapping

function toUserDto(entity: User): UserResponseDto {
  return {
    id: entity.id,
    email: entity.email
  };
}

---

## MUST NOT

- return Prisma models directly
- reuse DB schema as API contract

---

# 5. Module Design

## Example Structure

auth/
  auth.controller.ts
  auth.service.ts
  dto/
  mappers/
  __tests__/

---

## Controller Example

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.service.login(dto);
  }
}

---

## Service Example

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true, email: true, password: true }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { token: '...' };
  }
}

---

# 6. Microservices Guidelines

## Communication

- default: HTTP
- async messaging only when required (high load / decoupling)

---

## Contracts

MUST:
- use DTOs for inter-service communication
- version contracts if breaking changes

---

## Idempotency

- write operations must be idempotent where possible
- use unique constraints and guards

---

# 7. Error Handling

MUST:
- throw NestJS exceptions from services

Example:

throw new NotFoundException('User not found');

---

MUST NOT:
- swallow errors
- return raw error objects

---

# 8. Validation

- use class-validator
- validate all incoming DTOs

Example:

@IsEmail()
email!: string;

---

# 9. Testing

## Structure

__tests__/
  service.spec.ts
  controller.spec.ts

---

## Rules

MUST:
- mock PrismaService
- test business logic

MUST NOT:
- use real DB in unit tests

---

# 10. AI Agent Rules

## MUST

- follow existing folder structure
- generate DTOs for all inputs/outputs
- use PrismaService only
- create mappers for transformations
- write type-safe code

---

## MUST NOT

- introduce new architectural patterns
- bypass service layer
- access DB directly
- return raw Prisma models
- mix layers

---

## Feature Implementation Flow

1. Define DTOs
2. Implement service logic
3. Add mapper
4. Connect controller
5. Add tests

---

# 11. Naming Conventions

| Element     | Convention               |
|-------------|--------------------------|
| DTO         | SomethingDto             |
| Response    | SomethingResponseDto     |
| Service     | SomethingService         |
| Controller  | SomethingController      |
| Mapper      | something.mapper.ts      |

---

# 12. Performance

MUST:
- use `select`
- avoid N+1 queries
- batch queries where possible

---

# 13. Configuration

- use ConfigModule
- no hardcoded values
- use env variables

---

# 14. Security

MUST:
- never expose sensitive fields
- hash passwords
- validate input strictly

---

# 15. Observability (Recommended)

- structured logging
- request tracing
- error monitoring

---

# 16. Summary

AI agents must:
- enforce strict layering
- isolate Prisma
- maintain DTO boundaries
- produce predictable, production-grade code