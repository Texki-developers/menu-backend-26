# AI Code Generation Rules

This document defines **strict rules and standards** that an AI must follow while generating code for this system.
These rules are mandatory and must be applied consistently across all generated outputs.
The goal is **scalable, maintainable, production-grade code** with zero assumptions.

---

## 1. General Coding Principles

* Always write **clean, readable, and self-explanatory code**
* Follow **industry-standard naming conventions**
* Avoid shortcuts or hacky implementations
* Prefer **clarity over cleverness**
* Code must be production-ready, not demo-quality

---

## 2. Architecture & Design

* Follow **modular architecture** strictly
* Each module must have a **single responsibility**
* Never mix concerns (e.g., controller logic inside services)
* Use **dependency injection** everywhere
* Code must support **horizontal scaling**

---

## 3. NestJS-Specific Rules (Mandatory)

* Follow **official NestJS best practices**
* Use NestJS constructs correctly:

  * Controllers → request handling only
  * Services → business logic only
  * Providers → reusable logic
  * Modules → logical grouping
* Always use:

  * `@Injectable()` for services
  * `@Controller()` for controllers
  * `@Module()` for modules
* Do NOT bypass NestJS patterns

---

## 4. No Assumptions Rule

* Never assume:

  * Default values
  * Existing records
  * User permissions
  * Request shape
  * Environment configuration
* Every input must be **validated explicitly**
* Every dependency must be **declared and injected**

---

## 5. Constants & Enums Handling

* Do NOT hardcode strings or numbers directly in logic

❌ Forbidden:

```ts
if (role === 'CUSTOMER') {}
```

✅ Mandatory:

```ts
import { USER_ROLES } from '@/constants/user-roles.constant';

if (role === USER_ROLES.CUSTOMER) {}
```

### Rules

* All constants must live in:

  * `/constants`
  * `/enums`
* Use enums only when values are finite and well-defined
* Reuse constants across modules

---

## 6. Validation Rules

* Always use **DTOs** for request validation
* Use `class-validator` and `class-transformer`
* Never accept raw request bodies
* DTOs must:

  * Validate types
  * Validate enums
  * Validate optional vs required fields

---

## 7. Error Handling

* Never throw generic errors
* Always use:

  * `HttpException`
  * `BadRequestException`
  * `NotFoundException`
  * `UnauthorizedException`
* Errors must be:

  * Meaningful
  * Predictable
  * Consistent

---

## 8. Database Access Rules

* Database access must be inside **repositories or services**
* No database logic inside controllers
* Always scope queries using:

  * `organization_id`
  * `branch_id`
* Avoid over-fetching data
* Use indexes-aware queries

---

## 9. Scalability & Performance

* Write code assuming **high traffic**
* Avoid synchronous blocking operations
* Use pagination for all list APIs
* Design APIs to be stateless
* Prefer aggregation pipelines for analytics

---

## 10. Testing Rules (Mandatory)

* Always consider testing while writing code
* Provide:

  * Unit tests for services
  * Integration tests for controllers
* Use `@nestjs/testing`
* Mock external dependencies
* Tests must cover:

  * Success cases
  * Failure cases
  * Edge cases

---

## 11. Swagger & API Documentation

* Swagger documentation is mandatory
* Always use:

  * `@ApiTags`
  * `@ApiOperation`
  * `@ApiResponse`
* DTOs must be documented using:

  * `@ApiProperty`
* APIs must be:

  * Self-descriptive
  * Well-documented

---

## 12. Security Rules

* Never expose sensitive data
* Validate authentication and authorization explicitly
* Never trust client input
* Use role-based access control
* Sanitize all inputs

---

## 13. Logging & Observability

* Use NestJS Logger or a centralized logger
* Log:

  * Errors
  * Critical business actions
  * External failures
* Do NOT log sensitive information

---

## 14. Configuration & Environment

* Use `@nestjs/config`
* Never hardcode environment values
* All configs must come from environment variables
* Validate config values at startup

---

## 15. Code Reusability & Maintainability

* Avoid duplication
* Extract reusable logic
* Use shared modules where applicable
* Keep functions small and focused

---

## 16. API Design Rules

* Follow REST principles
* Use proper HTTP methods
* Use meaningful HTTP status codes
* Version APIs if needed

---

## 17. AI Output Constraints

When generating code, the AI must:

* Output only valid TypeScript
* Follow this rule document strictly
* Ask for clarification if requirements are ambiguous
* Never invent fields or business logic

---

End of Code Generation Rules
