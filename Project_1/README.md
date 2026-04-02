

#  Project Overview 

This file walks  through building a **mono-repo microservices project** using **Spring Boot 3**, **PostgreSQL**, and **Docker**.
 
create two independent services:

* `product-service`
* `order-service`

Each service has its **own dedicated PostgreSQL database**.The `order-service` communicates with `product-service` over **HTTP REST** to validate that a product exists before placing an order.


### Components

| Component       | Port | Database   | Responsibility                      |
| --------------- | ---- | ---------- | ----------------------------------- |
| product-service | 8081 | product_db | CRUD for products catalog           |
| order-service   | 8083 | order_db   | Place orders, calls product-service |
| product-db      | 5433 | product_db | Dedicated PostgreSQL for products   |
| order-db        | 5435 | order_db   | Dedicated PostgreSQL for orders     |


---
# Postman API collection : [view collection](https://www.postman.com/mission-administrator-41711140/workspace/logistics-platform/collection/47147985-51012cc7-106b-4d14-b5d5-d72e546b842f?action=share&creator=47147985&active-environment=47147985-abbbf3aa-ed0d-428b-aa70-e3f5949902b7)

---

#  Environment Variables

### Root `.env`

Used by **Docker Compose** for database containers.

```env
# Database Credentials
DB_USER=postgres
DB_PASSWORD=postgresql

# Database Names
PRODUCT_DB_NAME=product_db
ORDER_DB_NAME=order_db
```



### product-service/.env

```env
DB_HOST=product-db
DB_PORT=5432
DB_NAME=product_db
DB_USER=postgres
DB_PASSWORD=postgresql
PORT=8081
```


### order-service/.env

```env
DB_HOST=order-db
DB_PORT=5432
DB_NAME=order_db
DB_USER=postgres
DB_PASSWORD=postgresql
PORT=8083
PRODUCT_SERVICE_URL=http://product-service:8081
```

---

#  Important Key Points


## 1. localhost vs service name

Inside Docker containers, **do NOT use localhost**.

- Wrong : `PRODUCT_SERVICE_URL=http://localhost:8081`
- Correct:  `PRODUCT_SERVICE_URL=http://product-service:8081`



> Beacuse Containers talk via **service names,** not **localhost**.Because  services are running inside Docker, they cannot use localhost to talk to the databases. we must update the .env files inside  service folders to point to the container names.


## 2. `.env` loading (local vs Docker)

For **local development only**:

`product-service/application.yml` and `order-service/application.yml`
```yaml
config:
  import: optional:file:order-service/.env[.properties]
```

Remove this when running in Docker because Docker injects variables automatically.

- Local: Use `spring.config.import` for a dependency-free way to load `.env` files.

- Docker: Remove `config.import` and let the container engine inject variables into the environment to ensure portability and avoid path errors.





## 3. Password mismatch issue

Database password must match Spring Boot config.


`docker-compose.yml`

```yaml
services:
  product-db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=your_password  # <--- Check this
    ports:
      - "5435:5432"

  product-service:
    image: project_1-product-service
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://product-db:5432/postgres
      - SPRING_DATASOURCE_USERNAME=postgres
      - SPRING_DATASOURCE_PASSWORD=your_password # <--- Must match above
    depends_on:
      - product-db
 ```    



## 4. Remove `environment` block from `docker-compose.yml`

Using:

```yml
  product-service:
    build: ./product-service
    container_name: product-service
    ports:
      - '8081:8081'
    env_file:
      - ./product-service/.env
    depends_on:
      - product-db
    networks:
      - microservices-network  
```

Docker automatically injects all variables from `.env` into the container.

Since `.env` already contains:

```
DB_HOST=product-db
DB_PORT=5432
DB_NAME=product_db
PORT=8081
```

…and `application.yml` uses:

```
url: jdbc:postgresql://${DB_HOST}:${DB_PORT}/${DB_NAME}
```


>Spring Boot will automatically build the connection string itself. We don't need to manually write `SPRING_DATASOURCE_URL: jdbc:postgresql://product-db:5432/product_db` in the `docker-compose.yml` because Spring is smart enough to assemble it from the individual pieces (DB_HOST, DB_PORT, etc.) that it finds in the environment. present in shortly





---

#  Run & Test

### 1. Run with Docker

```bash
docker-compose up --build # Build images and start all 4 containers
docker-compose up --build -d # Run in background (detached mode)
docker ps # View running containers
docker-compose logs -f product-service # Follow logs of a specific service
docker-compose down # Stop all containers
docker-compose down -v # Stop and delete all volumes (wipes DB data)
```


### 2. Run Locally (without Docker)

Terminal 1: start product-service

```bash
cd product-service
./mvnw spring-boot:run
```

Terminal 2: start order-service

```bash
cd order-service
./mvnw spring-boot:run
```

---

#  API Endpoints

### Product Service (8081)

| Method | Endpoint                                  | Description       |
| ------ | ----------------------------------------- | ----------------- |
| POST   | /api/products                             | Create product    |
| GET    | /api/products                             | Get all products  |
| GET    | /api/products/{id}                        | Get product by ID |
| PUT    | /api/product/{id}/update-stock?quantity=5 | Update stock      |
| DELETE | /api/products/{id}                        | Delete product    |



### Order Service (8083)

| Method | Endpoint    | Description    |
| ------ | ----------- | -------------- |
| POST   | /api/orders | Place order    |
| GET    | /api/orders | Get all orders |

---

#  API Examples

## 1.1 Create Product

**POST** `http://localhost:8081/api/products`

**Request**

```json
{
  "name": "string",
  "description": "string",
  "price": Double,
  "stock": Integer
}
```

**Response — 201 Created**

```json
{
  "id": Long,
  "name": "string",
  "description": "string",
  "price": Double,
  "stock": Integer
}
```

**Errors** - **400 Bad Request** — Missing or invalid fields.

---

### 1.2 Update Stock 

**PUT** `http://localhost:8081//api/product/{id}/update-stock?quantity=5 `

**Request**

```json
{
  "id": Long,
  "quantity": Long 
}
```

**Response — 200 ok**

```json
{
  "id": Long,
  "name": "string",
  "description": "string",
  "price": Double,
  "stock": Integer,
}
```

**Errors** 
- **404 No Found** — productId no found. 
- **400 Bad Request** — Missing or invalid fields. 

---
### 1.3 Place Order 

**POST** `http://localhost:8083/api/orders` 


**Request**

```json
{
  "productId": Long,
  "quantity": Long 
}
```

**Response — 200 ok**

```json
{
  "id": "Long",
  "productId": Long,
  "quantity": Long,
  "status": "PENDING | CONFIRMED, | CANCELLED"
}
```

**Errors** 
- **404 No Found** — productId no found.
 - **400 Bad Request** — Insufficient Stock