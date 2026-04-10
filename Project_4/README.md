
# Project Overview

This is a microservices-based e-commerce application.

| Component       | Port | Database   | Responsibility                      |
| --------------- | ---- | ---------- | ----------------------------------- |
| user-service | 8081 | user_db |  Authentication/authorization with JWT, user registration/login           |
| product-service | 8083 | product_db | CRUD for products catalog           |
| order-service   | 8084 | order_db   | Place orders, calls product-service |
| front-end   | 3000 |    | create-react-app basd |



Each service has its **own dedicated PostgreSQL database**.The `order-service` communicates with `product-service` over **HTTP REST** to validate that a product exists before placing an order.

> **Feature Demonstration Video on YouTube : [Click Here](https://www.youtube.com/watch?v=oeppcZjKc0U)**
---



## Environment Variables setup


### user-service/.env

Create a `.env` file inside `user-service/` and add the following:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/user_db
SPRING_DATASOURCE_USERNAME=USERNAME
SPRING_DATASOURCE_PASSWORD=PASSWORD

# JWT 
JWT_SECRET_KEY=
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Front-end server 
DEV_SERVER=http://localhost:5175
```



### product-service/.env

Create a `.env` file inside `product` and add the following:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/product_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgresql

DEV_SERVER=http://localhost:3000
```


### order-service/.env

Create a `.env` file inside `order` and add the following:


```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/order_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgresql

DEV_SERVER=http://localhost:3000

# CORS  allow React dev server

USER_URL= http://localhost:8081
PRODUCT_URL= http://localhost:8083
```
---


# Architecture

### Authentication Flow
- User service issues JWT tokens on `login/register`
- JWT filter validates tokens and sets authentication context
- Other services (product, order) expect user context via request headers:
  - `X-User-Id`: User identifier
  - `X-User-Email`: User email
  - `X-User-Role`: "ADMIN" or "USER"
- Frontend stores user data in localStorage (`shop_user` key)

### Inter-Service Communication
- Order service uses `RestTemplate` (configured in `RestTemplateConfig.java`) to call product service for:
  - Fetching product details during order placement
  - Checking stock availability
  - Decrementing stock after order confirmation
- Base URLs configured via `.env` files (`USER_URL`, `PRODUCT_URL`)

### Security Configuration
- **User Service**: JWT-based with stateless sessions (`AppSecurityConfig.java`)
  - Public endpoints: `/public/register`, `/public/login`, `/actuator/**`
  - Admin-only: `/api/users/admin/**`
  - All others require authentication
- **Product/Order Services**: Permit all requests but rely on header-based auth
- CORS configured to allow frontend at `http://localhost:3000`


---

# Run  & Test 

### 1. Run with Docker

Each backend service uses a **two-stage Maven build**.The frontend uses a **two-stage Node build**.

#### docker-compose.yml

Spins up **7 containers** on a shared `microservices-network`:

| Container | Image | Port |
|---|---|---|
| user-db | postgres:16-alpine | 5433 |
| product-db | postgres:16-alpine | 5435 |
| order-db | postgres:16-alpine | 5434 |
| user-service | project build | 8081 |
| product-service | project build | 8083 |
| order-service | project build | 8084 |
| frontend | project build | 3000 |

>  Use container names as hostnames (e.g. `user-db`, `product-service`)  **not** `localhost`  inside `.env` files when running with Docker.


```bash
docker compose up --build # Build images and start all 4 containers
docker compose up --build -d # Run in background (detached mode)
docker ps # View running containers
doker compose logs -f # view longs
docker-compose logs -f product-service # Follow logs of a specific service
docker-compose down # Stop all containers
docker-compose down -v # Stop and delete all volumes (wipes DB data)
```

#### View Database Records

```bash
# Connect to any database
docker exec -it user-db    psql -U postgres -d user_db
docker exec -it product-db psql -U postgres -d product_db
docker exec -it order-db   psql -U postgres -d order_db
# Example: list all users
docker exec -it user-db psql -U postgres -d user_db -c "SELECT * FROM users;"
```



### 2. Run Locally (without Docker)

Run each service step by step:
- user-service
- product-service
- order-service
- frontend 


####  Frontend (Node.js/React)
```bash
cd frontend
npm install
npm start          # Dev server on localhost:3000
npm run build      # Production build
```

#### Backend Services (Maven/Spring Boot)
Each service uses Maven Wrapper. Run the following command from each service root directory:


```bash
cd user-service
./mvnw spring-boot:run

cd product-service
./mvnw spring-boot:run

cd order-service
./mvnw spring-boot:run
```



















---

# API Documentation

## User Service (Port 8081)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/public/register` | Register new user |
| POST | `/public/login` | Authenticate user |

#### 1.1 Register User

```http
POST http://localhost:8081/public/register
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
POST http://localhost:8081/public/login
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

## Product Service (Port 8083)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create product (Admin only) |
| GET | `/api/products` | List all products |
| GET | `/api/products/{id}` | Get product by ID |
| PUT | `/api/products/{id}` | Update product (Admin only) |
| DELETE | `/api/products/{id}` | Delete product (Admin only) |
| PATCH | `/api/products/{id}/stock?quantity={qty}` | Decrement stock (Internal) |

#### 2.1 Create Product

```http
POST http://localhost:8083/api/products
```

**Headers**
- `X-User-Id`: Admin user ID
- `X-User-Role`: ADMIN

**Request**

```json
{
  "name": "string",
  "description": "string",
  "price": 99.99,
  "stockQuantity": 100,
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
  "price": 99.99,
  "stockQuantity": 100,
  "category": "string",
  "imageUrl": "string",
  "active": true,
  "createdAt": "2024-01-15T10:30:00",
  "createdBy": "string"
}
```

**Errors**
- `400 Bad Request` — Missing or invalid fields
- `403 Forbidden` — Non-admin user

#### 2.2 List All Products

```http
GET http://localhost:8083/api/products
```

**Response — 200 OK**

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "price": 99.99,
    "stockQuantity": 100,
    "category": "string",
    "imageUrl": "string",
    "active": true,
    "createdAt": "2024-01-15T10:30:00",
    "createdBy": "string"
  }
]
```

#### 2.3 Get Product by ID

```http
GET http://localhost:8083/api/products/{id}
```

**Response — 200 OK**

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": 99.99,
  "stockQuantity": 100,
  "category": "string",
  "imageUrl": "string",
  "active": true,
  "createdAt": "2024-01-15T10:30:00",
  "createdBy": "string"
}
```

**Errors**
- `404 Not Found` — Product does not exist

#### 2.4 Update Product

```http
PUT http://localhost:8083/api/products/{id}
```

**Headers**
- `X-User-Role`: ADMIN

**Request**

```json
{
  "name": "string",
  "description": "string",
  "price": 99.99,
  "stockQuantity": 100,
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
  "price": 99.99,
  "stockQuantity": 100,
  "category": "string",
  "imageUrl": "string",
  "active": true,
  "createdAt": "2024-01-15T10:30:00",
  "createdBy": "string"
}
```

**Errors**
- `400 Bad Request` — Missing or invalid fields
- `403 Forbidden` — Non-admin user
- `404 Not Found` — Product does not exist

#### 2.5 Delete Product

```http
DELETE http://localhost:8083/api/products/{id}
```

**Headers**
- `X-User-Role`: ADMIN

**Response — 204 No Content**

**Errors**
- `403 Forbidden` — Non-admin user
- `404 Not Found` — Product does not exist

#### 2.6 Decrement Stock (Internal)

```http
PATCH http://localhost:8083/api/products/{id}/stock?quantity={qty}
```

**Response — 200 OK**

---

## Order Service (Port 8084)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place new order |
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/{id}` | Get order by ID |

#### 3.1 Place Order

```http
POST http://localhost:8084/api/orders
```

**Headers**
- `X-User-Id`: User ID
- `X-User-Email`: User email

**Request**

```json
{
  "shippingAddress": "string",
  "items": [
    {
      "productId": "string",
      "quantity": 2
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
  "totalAmount": 199.98,
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": 2,
      "unitPrice": 99.99,
      "subtotal": 199.98
    }
  ],
  "createdAt": "2024-01-15T10:30:00"
}
```

**Errors**
- `400 Bad Request` — Invalid shipping address, empty items, or invalid quantities
- `500 Internal Server Error` — Insufficient stock or product not found

#### 3.2 Get User Orders

```http
GET http://localhost:8084/api/orders
```

**Headers**
- `X-User-Id`: User ID

**Response — 200 OK**

```json
[
  {
    "id": "string",
    "userId": "string",
    "userEmail": "string",
    "shippingAddress": "string",
    "status": "CONFIRMED",
    "totalAmount": 199.98,
    "items": [
      {
        "productId": "string",
        "productName": "string",
        "quantity": 2,
        "unitPrice": 99.99,
        "subtotal": 199.98
      }
    ],
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

#### 3.3 Get Order by ID

```http
GET http://localhost:8084/api/orders/{id}
```

**Headers**
- `X-User-Id`: User ID

**Response — 200 OK**

```json
{
  "id": "string",
  "userId": "string",
  "userEmail": "string",
  "shippingAddress": "string",
  "status": "CONFIRMED",
  "totalAmount": 199.98,
  "items": [
    {
      "productId": "string",
      "productName": "string",
      "quantity": 2,
      "unitPrice": 99.99,
      "subtotal": 199.98
    }
  ],
  "createdAt": "2024-01-15T10:30:00"
}
```

**Errors**
- `404 Not Found` — Order not found or user does not own this order
