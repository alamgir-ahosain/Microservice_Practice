# Project Overview

This is a **Hospital Management System** built with a microservices architecture. The application provides authentication, hospital/doctor management, and an AI-powered chatbot for hospital/doctor search assistance.

| Component         | Port | Technology Stack                          | Responsibility                                      |
| ----------------- | ---- | ---------------------------------------- | --------------------------------------------------- |
| auth-service      | 8081 | Spring Boot 3.5.11, Java 21, PostgreSQL  | JWT authentication, user registration/login         |
| hospital-service  | 8083 | Spring Boot 4.0.3, Java 21, PostgreSQL   | Hospital, doctor, patient & appointment management  |
| chat-service      | 8085 | Python 3.x, FastAPI, LangChain, Gemini   | AI chatbot for hospital/doctor search               |
| hospital-frontend | 3000 | React 19, Vite                           | React SPA for hospital management UI                |


> **Feature Demonstration Video on YouTube : [Click Here](https://www.youtube.com/watch?v=FatAzGfg-1o)**



---

# Tech Stack Details

### Backend (Java Services)
- **Spring Boot**: 3.5.11 (auth-service), 4.0.3 (hospital-service)
- **Java**: 21
- **Security**: Spring Security with JWT (jjwt 0.12.3)
- **Database**: PostgreSQL with Spring Data JPA
- **Validation**: Jakarta Validation
- **Utilities**: Lombok, dotenv

### AI Chat Service (Python)
- **Framework**: FastAPI
- **AI/ML**: LangChain, Google Gemini (gemini-2.5-flash)
- **HTTP Client**: httpx
- **Fuzzy Matching**: rapidfuzz
- **Environment**: python-dotenv

### Frontend
- **Framework**: React 19.2.4
- **Routing**: React Router DOM 7.13.1
- **HTTP Client**: Axios 1.13.6
- **Testing**: React Testing Library, Jest
- **Build Tool**: Create React App (CRA)


---
# Run Project

## Prerequisites

- Java 21
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

## Database Setup

Create the required databases:

```sql
CREATE DATABASE hospital_auth;
CREATE DATABASE hospital_core;
```

---

# Environment Setup

Each service requires environment variables. Create `.env` files:

### auth-service/.env

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/hospital_auth
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET_KEY=your-jwt-secret
JWT_EXPIRATION=86400000
DEV_SERVER=http://localhost:3000
```

### hospital-service/.env

```properties
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/hospital_core
SPRING_DATASOURCE_USERNAME=username
SPRING_DATASOURCE_PASSWORD=password
JWT_SECRET_KEY=your-jwt-secret
JWT_EXPIRATION=86400000
DEV_SERVER=http://localhost:3000
GEMINI_API_KEY=your-gemini-api-key
```

### chat-service/.env

```properties
GMINI_API_KEY=your-google-api-key
HOSPITAL_SERVICE_URL=http://localhost:8083
```

---
# Service Startup


### 1. Backend Services (Start First)

```bash
# Auth Service
cd auth-service
./mvnw spring-boot:run

# Hospital Service
cd hospital-service
./mvnw spring-boot:run

# Chat Service
cd chat-service
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8085 --reload                        
```

### 2. Frontend (Last)

```bash
cd hospital-frontend
npm install
npm start        # Dev server on localhost:3000
```

---

##  **Acces the API**


```
http://localhost:3000
http://localhost:3000/register
http://localhost:3000/login
 http://localhost:3000/dashboard    [ADMIN only]
```
---

# Architecture

### Service Startup Order
1. **auth-service** (port 8081) - Handles authentication and user management
2. **hospital-service** (port 8083) - Core business logic for hospitals, doctors, patients, appointments
3. **chat-service** (port 8085) - AI-powered chatbot for search assistance
4. **hospital-frontend** (port 3000) - React application

### Authentication Flow
- JWT-based authentication using HS256 algorithm
- Token expiration: 24 hours (86400000 ms)
- Frontend stores token in `localStorage` and sends via `Authorization: Bearer` header
- All protected endpoints require valid JWT token

### AI Chatbot Features
The chat-service provides an intelligent assistant (MediBot) that can:
- Search hospitals by type, city, thana, name, or GPS location
- Search doctors by specialty, name, city, or hospital
- Get detailed information about specific hospitals or doctors
- Handle fuzzy matching for typos in search queries
- Provide conversational interface for hospital/doctor discovery

### Database Schema
- **hospital_auth** (auth-service): Users table for authentication
- **hospital_core** (hospital-service): Hospitals, Doctors, Patients, Appointments, Locations

---

# API Documentation

Base URLs:
- Auth Service: `http://localhost:8081`
- Hospital Service: `http://localhost:8083`
- Chat Service: `http://localhost:8085`

## Public Endpoints (No Authentication Required)

### Auth Service

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| POST   | `/api/auth/register`  | Register new user    |
| POST   | `/api/auth/login`     | Authenticate user    |

#### 1.1 Register User

```http
POST http://localhost:8081/api/auth/register
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
POST http://localhost:8081/api/auth/login
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

### Hospital Service - Hospital Management

| Method | Endpoint                              | Description                    |
| ------ | ------------------------------------- | ------------------------------ |
| POST   | `/hospital/v1/register`               | Register new hospital          |
| GET    | `/hospital/v1`                        | List all hospitals             |
| GET    | `/hospital/v1/{id}`                   | Get hospital by ID             |
| PUT    | `/hospital/v1/{id}`                   | Update hospital                |
| DELETE | `/hospital/v1/{id}`                   | Delete hospital                |

#### 2.1 Register Hospital

```http
POST http://localhost:8083/hospital/v1/register
```

**Headers**
- `Authorization: Bearer <token>`

**Request**

```json
{
  "name": "string",
  "description": "string",
  "phoneNumber": "string",
  "email": "string",
  "website": "string",
  "latitude": Double,
  "longitude": Double,
  "hospitalType": ["PUBLIC", "GENERAL"],
  "location": {
    "address": "string",
    "thana": "string",
    "po": "string",
    "city": "string",
    "postalCode": Long,
    "zoneId": Long
  },
  "latitude": Double,
  "longitude": Double
}
```

**Response — 201 Created**

```json
{
  "id": Long,
  "name": "string",
  "phoneNumber": "string",
  "website": "string",
  "types": ["PUBLIC", "GENERAL"...],
  "locationResponse": {
    "address": "string",
    "thana": "string",
    "po": "string",
    "city": "string",
    "postalCode": Long,
    "zoneId": Long
  }
}
```

#### 2.2 List All Hospitals

```http
GET http://localhost:8083/hospital/v1
```

**Response — 200 OK**

Returns array of hospital objects.

#### 2.3 Get Hospital by ID

```http
GET http://localhost:8083/hospital/v1/{id}
```

**Response — 200 OK**

Returns single hospital object.

**Errors**
- `404 Not Found` — Hospital does not exist

---

# Hospital Service - Doctor Management

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| POST   | `/api/doctors`        | Create doctor                  |
| GET    | `/api/doctors`        | List all doctors               |
| GET    | `/api/doctors/{id}`   | Get doctor by ID               |
| PUT    | `/api/doctors/{id}`   | Update doctor                  |
| DELETE | `/api/doctors/{id}`   | Delete doctor                  |

#### 3.1 Create Doctor

```http
POST http://localhost:8083/api/doctors
```

**Headers**
- `Authorization: Bearer <token>`

**Request**

```json
{
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "specialties": ["Cardiology", "Internal Medicine"],
  "location": {
    "address": "string",
    "thana": "string",
    "po": "string",
    "city": "string",
    "postalCode": Long,
    "zoneId": Long
  },
  "hospitalIds": [Integer],
  ]
}
```

**Response — 201 Created**

```json
{
  "id": Long,
  "name": "string",
  "email": "string",
  "phoneNumber": "string",
  "specialties": ["Cardiology", "Internal Medicine"],
  "locationResponse": {...},
  "doctorHospitals": [...],
}
```

---

### Hospital Service - Patient Management

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| POST   | `/api/patients`          | Create patient                 |
| GET    | `/api/patients`          | List all patients              |
| GET    | `/api/patients/{id}`     | Get patient by ID              |
| PUT    | `/api/patients/{id}`     | Update patient                 |
| DELETE | `/api/patients/{id}`     | Delete patient                 |

---

### Hospital Service - Appointment Management

| Method | Endpoint                          | Description                    |
| ------ | --------------------------------- | ------------------------------ |
| POST   | `/api/appointments`               | Create appointment             |
| GET    | `/api/appointments`               | List all appointments          |
| GET    | `/api/appointments/{id}`          | Get appointment by ID          |
| GET    | `/api/appointments/patient/{pid}`   | Get appointments by patient    |
| GET    | `/api/appointments/doctor/{did}`    | Get appointments by doctor     |
| PUT    | `/api/appointments/{id}`            | Update appointment             |
| DELETE | `/api/appointments/{id}`            | Delete appointment             |

---

### Chat Service - AI Chatbot

| Method | Endpoint                  | Description                              |
| ------ | ------------------------- | ---------------------------------------- |
| GET    | `/`                       | Health check                             |
| GET    | `/chat/v1/test`           | Service health check                     |
| POST   | `/chat/v1/send`           | Send message to chatbot                  |
| DELETE | `/chat/v1/session/{userId}` | Clear conversation history               |

#### 4.1 Send Chat Message

```http
POST http://localhost:8085/chat/v1/send
```

**Request**

```json
{
  "userId": "user-123",
  "message": "Find cardiologists in Dhaka",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00"
}
```

**Response — 200 OK**

```json
{
  "content": "I found 3 cardiologists in Dhaka:\n\n• Dr. John Doe - Cardiology, Dhaka Medical College\n• Dr. Jane Smith - Cardiology, Square Hospital\n• Dr. Robert Wilson - Cardiology, Apollo Hospital",
  "id": "user-123_assistant_5",
  "role": "assistant",
  "createdAt": "2024-01-15T10:31:00"
}
```

#### 4.2 Clear Session

```http
DELETE http://localhost:8085/chat/v1/session/{userId}
```

**Response — 200 OK**

```
Session for 'user-123' cleared.
```

---

# Testing the System

1. **Start all backend services** (auth-service, hospital-service, chat-service)
2. **Start frontend**: `cd hospital-frontend && npm start`
3. **Access the app** at `http://localhost:3000`
4. **API Endpoints**:
   - Auth Service: `http://localhost:8081`
   - Hospital Service: `http://localhost:8083`
   - Chat Service: `http://localhost:8085`
