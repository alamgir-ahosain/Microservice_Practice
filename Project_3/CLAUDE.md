# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a microservices-based e-commerce system built with Spring Boot 3.5.13 (Java 21) and React (Vite).

### Service Architecture

The system follows a typical Spring Cloud microservices pattern:

1. **Infrastructure Services** (start first):
   - `config-server` (port 8888) - Centralized configuration using native file system
   - `service-registry` (port 8761) - Eureka server for service discovery
   - `api-gateway` (port 8080) - Spring Cloud Gateway with JWT authentication

2. **Business Services** (register with Eureka):
   - `user-service` (port 8081) - Authentication/authorization with JWT
   - `product-service` (port 8083) - Product catalog management
   - `order-service` (port 8084) - Order processing with Feign client to product-service

3. **Frontend**:
   - `frontend/` (port 5175) - React + Vite SPA

### Inter-Service Communication

- **Service Discovery**: Eureka (all services register at `http://localhost:8761/eureka/`)
- **Inter-service calls**: OpenFeign (order-service → product-service via `@FeignClient(name = "product-service")`)
- **External API access**: Through API Gateway at `http://localhost:8080`

### Security Flow

1. JWT tokens are issued by `user-service`
2. API Gateway validates JWTs in `JwtAuthenticationFilter` (public paths: `/public/register`, `/public/login`)
3. Valid tokens have user info added as headers (`X-User-Id`, `X-User-Role`, `X-User-Email`) for downstream services
4. Frontend stores token in `localStorage` and sends via `Authorization: Bearer` header

### Database Configuration

Each service connects to its own PostgreSQL database (configured via config-server):
- user-service → `jdbc:postgresql://localhost:5432/user_db`
- product-service → `jdbc:postgresql://localhost:5432/product_db`
- order-service → `jdbc:postgresql://localhost:5432/user_db` (note: same as user-service)

Credentials: postgres / postgresql

## Common Commands

### Java Services (Maven)

All services use Maven wrapper (`./mvnw`) and require Java 21.

**Build a service:**
```bash
cd <service-name> && ./mvnw clean package
```

**Run a service:**
```bash
cd <service-name> && ./mvnw spring-boot:run
```

**Run tests for a service:**
```bash
cd <service-name> && ./mvnw test
```

**Run a single test class:**
```bash
cd <service-name> && ./mvnw test -Dtest=ClassName
```

**Startup Order:**
1. config-server (port 8888)
2. service-registry (port 8761)
3. api-gateway (port 8080)
4. user-service, product-service, order-service (ports 8081, 8083, 8084 - any order)

### Frontend

**Install dependencies:**
```bash
cd frontend && npm install
```

**Start dev server:**
```bash
cd frontend && npm run dev
```

**Build for production:**
```bash
cd frontend && npm run build
```

## Configuration

Service configurations are externalized in `config-server/src/main/resources/configs/`:
- `<service-name>.properties` - Database, JWT, CORS settings
- Configs use native filesystem (not Git) with `spring.profiles.active=native`

## API Gateway Routes

Routes are configured in `api-gateway/src/main/resources/application.properties`:
- `/public/**` → user-service
- `/api/users/**` → user-service
- `/api/products/**` → product-service
- `/api/orders/**` → order-service

Load balancing uses `lb://` prefix with service names from Eureka.

## Testing the System

1. Start all infrastructure and business services
2. Start frontend: `cd frontend && npm run dev`
3. Access the app at `http://localhost:5175`
4. API Gateway is available at `http://localhost:8080`
5. Eureka dashboard at `http://localhost:8761`

## Key Technical Details

- Spring Boot 3.5.13 with Spring Cloud 2025.0.2
- JWT tokens validated at gateway and passed as headers to services
- CORS configured for React dev server (port 5175)
- Hibernate DDL auto set to `update` for development
- Lombok used throughout for boilerplate reduction
