# Project Overview

This is a microservices-based e-commerce application built with Spring Boot 3.5.13 (Java 21) and React (Vite).

| Component         | Port | Database     | Responsibility                                      |
| ----------------- | ---- | ------------ | --------------------------------------------------- |
| config-server     | 8888 | -            | Config Server - one place for all config |
| service-registry  | 8761 | -            | Eureka server for service discovery                 |
| api-gateway       | 8080 | -            | Spring Cloud Gateway with JWT authentication        |
| user-service      | 8081 | user_db      | Authentication/authorization with JWT, user registration/login |
| product-service   | 8083 | product_db   | CRUD for products catalog                           |
| order-service     | 8084 | order_db     | Place orders, calls product-service via Feign       |
| front-end         | 5175 | -            | React + Vite SPA                                    |

Each service has its **own dedicated PostgreSQL database** (where applicable). Services communicate via **Eureka service discovery** and **OpenFeign** for inter-service calls.

> **Feature Demonstration Video on YouTube: [Click Here](https://www.youtube.com/watch?v=Ocy12Dp4rmI)**

---

# Run Project

Services must be started in the following order:

### 1. Infrastructure Services (Start First)

```bash
# Config Server
cd config-server
./mvnw spring-boot:run

# Service Registry (Eureka)
cd service-registry
./mvnw spring-boot:run

# API Gateway
cd api-gateway
./mvnw spring-boot:run
```

### 2. Business Services 

```bash
# User Service
cd user-service
./mvnw spring-boot:run

# Product Service
cd product-service
./mvnw spring-boot:run

# Order Service
cd order-service
./mvnw spring-boot:run
```

### 3. Frontend (Last)

```bash
cd frontend
npm install
npm run dev        # Dev server on localhost:5175
```

---

# Environment Variables

Each service has its own `.env` file with the following configurations:

### config-server/application.properties

```properties
spring.application.name=config-server
server.port=8888
spring.profiles.active=native
spring.cloud.config.server.native.search-locations=classpath:/configs
```

### service-registry/application.properties

```properties
spring.application.name=service-registry
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
```

### api-gateway/application.properties

```properties
spring.application.name=api-gateway
server.port=8080

# Eureka Client
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# Gateway Routes
spring.cloud.gateway.routes[0].id=user-service
spring.cloud.gateway.routes[0].uri=lb://user-service
spring.cloud.gateway.routes[0].predicates[0]=Path=/public/**, /api/users/**

spring.cloud.gateway.routes[1].id=product-service
spring.cloud.gateway.routes[1].uri=lb://product-service
spring.cloud.gateway.routes[1].predicates[0]=Path=/api/products/**

spring.cloud.gateway.routes[2].id=order-service
spring.cloud.gateway.routes[2].uri=lb://order-service
spring.cloud.gateway.routes[2].predicates[0]=Path=/api/orders/**

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000
```

### user-service/application.properties

```properties
spring.application.name=user-service
server.port=8081

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/user_db
spring.datasource.username=postgres
spring.datasource.password=postgresql
spring.jpa.hibernate.ddl-auto=update

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# CORS
cors.allowed-origins=http://localhost:5175
```

### product-service/application.properties

```properties
spring.application.name=product-service
server.port=8083

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/product_db
spring.datasource.username=postgres
spring.datasource.password=postgresql
spring.jpa.hibernate.ddl-auto=update

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# CORS
cors.allowed-origins=http://localhost:5175
```

### order-service/application.properties

```properties
spring.application.name=order-service
server.port=8084

# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/order_db
spring.datasource.username=postgres
spring.datasource.password=postgresql
spring.jpa.hibernate.ddl-auto=update

# Eureka
eureka.client.service-url.defaultZone=http://localhost:8761/eureka/

# CORS
cors.allowed-origins=http://localhost:5175
```

---

# Architecture

### Service Startup Order
1. **config-server** (port 8888) - Provides centralized configuration
2. **service-registry** (port 8761) - Eureka server for service discovery
3. **api-gateway** (port 8080) - Routes requests and handles JWT validation
4. **Business Services** (user-service, product-service, order-service)
5. **frontend** (port 5175) - React application

### Authentication Flow
- API Gateway validates JWT tokens in `JwtAuthenticationFilter`
- Public endpoints: `/public/register`, `/public/login`
- Valid tokens have user info added as headers for downstream services:
  - `X-User-Id`: User identifier
  - `X-User-Email`: User email
  - `X-User-Role`: "ADMIN" or "USER"
- Frontend stores token in `localStorage` and sends via `Authorization: Bearer` header

### Inter-Service Communication
- **Service Discovery**: Eureka (all services register at `http://localhost:8761/eureka/`)
- **Inter-service calls**: OpenFeign (order-service → product-service via `@FeignClient(name = "product-service")`)
- **External API access**: Through API Gateway at `http://localhost:8080`

### Security Configuration
- **API Gateway**: JWT-based authentication, validates tokens and forwards user headers
- **User Service**: Issues JWT tokens, handles registration/login
- **Product/Order Services**: Receive authenticated user info via headers from gateway
- CORS configured for React dev server (port 5175)

---

# API Documentation

Access all APIs through the API Gateway at `http://localhost:8080`

## Public Endpoints (No Authentication Required)

### User Service

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| POST   | `/public/register` | Register new user    |
| POST   | `/public/login`    | Authenticate user    |

#### 1.1 Register User

```http
POST http://localhost:8080/public/register
```

**Request**

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response — 201 Created**

```json
{
  "accessToken": "string",
  "userId": "string",
  "name": "string",
  "email": "string",
  "role": "USER"
}
```

**Errors**
- `400 Bad Request` — Invalid email format, password < 6 chars, or name < 2 chars

#### 1.2 Login User

```http
POST http://localhost:8080/public/login
```

**Request**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response — 200 OK**

```json
{
  "accessToken": "string",
  "userId": "string",
  "name": "string",
  "email": "string",
  "role": "USER"
}
```

**Errors**
- `401 Unauthorized` — Invalid credentials

---

# Protected Endpoints (Authentication Required)

Include `Authorization: Bearer <token>` header for all protected endpoints.

### User Service

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| GET    | `/api/users`       | Get all users (Admin only) |
| GET    | `/api/users/{id}`  | Get user by ID               |
| PUT    | `/api/users/{id}`  | Update user                  |
| DELETE | `/api/users/{id}`  | Delete user (Admin only)     |

---

### Product Service

| Method | Endpoint                              | Description                       |
| ------ | ------------------------------------- | --------------------------------- |
| POST   | `/api/products`                       | Create product (Admin only)       |
| GET    | `/api/products`                       | List all products                 |
| GET    | `/api/products/{id}`                  | Get product by ID                 |
| PUT    | `/api/products/{id}`                  | Update product (Admin only)       |
| DELETE | `/api/products/{id}`                  | Delete product (Admin only)       |
| PATCH  | `/api/products/{id}/stock?quantity={qty}` | Decrement stock (Internal)    |

#### 2.1 Create Product

```http
POST http://localhost:8080/api/products
```

**Headers**
- `Authorization: Bearer <token>` (Admin user required)

**Request**

```json
{
  "name": "string",
  "description": "string",
  "price": Double,
  "stockQuantity": Integer,
  "category": "string",
  "imageUrl": "string"
}
```

**Response — 201 Created**

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": Double,
  "stockQuantity": Integer,
  "category": "string",
  "imageUrl": "string",
  "active": true,
  "createdAt": LocalDateTime,
  "createdBy": "string"
}
```

**Errors**
- `400 Bad Request` — Missing or invalid fields
- `403 Forbidden` — Non-admin user

#### 2.2 List All Products

```http
GET http://localhost:8080/api/products
```

**Response — 200 OK**

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": Double,
    "stockQuantity": Integer,
    "category": "string",
    "imageUrl": "string",
    "active": true,
    "createdAt": LocalDateTime,
    "createdBy": "string"
  }
]
```

#### 2.3 Get Product by ID

```http
GET http://localhost:8080/api/products/{id}
```

**Response — 200 OK**

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": Double,
  "stockQuantity": Integer,
  "category": "string",
  "imageUrl": "string",
  "active": true,
  "createdAt": LocalDateTime,
  "createdBy": "string"
}
```

**Errors**
- `404 Not Found` — Product does not exist

#### 2.4 Update Product

```http
PUT http://localhost:8080/api/products/{id}
```

**Headers**
- `Authorization: Bearer <token>` (Admin user required)

**Request**

```json
{
  "name": "string",
  "description": "string",
  "price": Double,
  "stockQuantity": Integer,
  "category": "string",
  "imageUrl": "string"
}
```

**Response — 200 OK**

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": Double,
  "stockQuantity": Integer,
  "category": "string",
  "imageUrl": "string",
  "active": true,
  "createdAt": LocalDateTime,
  "createdBy": "string"
}
```

**Errors**
- `400 Bad Request` — Missing or invalid fields
- `403 Forbidden` — Non-admin user
- `404 Not Found` — Product does not exist

#### 2.5 Delete Product

```http
DELETE http://localhost:8080/api/products/{id}
```

**Headers**
- `Authorization: Bearer <token>` (Admin user required)

**Response — 204 No Content**

**Errors**
- `403 Forbidden` — Non-admin user
- `404 Not Found` — Product does not exist

#### 2.6 Decrement Stock (Internal)

```http
PATCH http://localhost:8080/api/products/{id}/stock?quantity={qty}
```

**Response — 200 OK**

---

# Order Service

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| POST   | `/api/orders`      | Place new order      |
| GET    | `/api/orders`      | Get user's orders    |
| GET    | `/api/orders/{id}` | Get order by ID      |

#### 3.1 Place Order

```http
POST http://localhost:8080/api/orders
```

**Headers**
- `Authorization: Bearer <token>`

**Request**

```json
{
  "shippingAddress": "string",
  "items": [
    {
      "productId": "string",
      "quantity": Integer
    }
  ]
}
```

**Response — 201 Created**

```json
{
  "id": "string",
  "userId": "string",
  "userEmail": "string",
  "shippingAddress": "string",
  "status": "CONFIRMED",
  "totalAmount": BigDecimal,
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": Integer,
      "unitPrice": BigDecimal,
      "subtotal": BigDecimal
    }
  ],
  "createdAt": LocalDateTime
}
```

**Errors**
- `400 Bad Request` — Invalid shipping address, empty items, or invalid quantities
- `500 Internal Server Error` — Insufficient stock or product not found

#### 3.2 Get User Orders

```http
GET http://localhost:8080/api/orders
```

**Headers**
- `Authorization: Bearer <token>`

**Response — 200 OK**

```json
[
  {
    "id": "string",
    "userId": "string",
    "userEmail": "string",
    "shippingAddress": "string",
    "status": "CONFIRMED",
    "totalAmount": BigDecimal,
    "items": [
      {
        "productId": "string",
        "productName": "string",
        "quantity": Integer,
        "unitPrice": BigDecimal,
        "subtotal": BigDecimal
      }
    ],
    "createdAt": LocalDateTime
  }
]
```

#### 3.3 Get Order by ID

```http
GET http://localhost:8080/api/orders/{id}
```

**Headers**
- `Authorization: Bearer <token>`

**Response — 200 OK**

```json
{
  "id": "string",
  "userId": "string",
  "userEmail": "string",
  "shippingAddress": "string",
  "status": "CONFIRMED",
  "totalAmount": BigDecimal,
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": Integer,
      "unitPrice": BigDecimal,
      "subtotal": BigDecimal
    }
  ],
  "createdAt": "2024-01-15T10:30:00"
}
```

**Errors**
- `404 Not Found` — Order not found or user does not own this order

---

# Testing the System

1. Start all infrastructure services (config-server, service-registry, api-gateway)
2. Start business services (user-service, product-service, order-service)
3. Start frontend: `cd frontend && npm run dev`
4. Access the app at `http://localhost:5175`
5. API Gateway is available at `http://localhost:8080`
6. Eureka dashboard at `http://localhost:8761`


