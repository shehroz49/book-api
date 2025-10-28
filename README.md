<!-- @format -->

# Book API

A RESTful API for managing books with authentication.

## Features

- User authentication (register, login)
- Book CRUD operations
- JWT token-based authentication
- Swagger API documentation
- MongoDB database integration

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/book-api

# Server Configuration
PORT=8080
NODE_ENV=development

# JWT Secret (for authentication)
JWT_SECRET=your-super-secret-jwt-key-here
```

3. Make sure MongoDB is running on your system

4. Start the server:

```bash
npm start
```

## API Documentation

Once the server is running, visit `http://localhost:8080/api-docs` for Swagger documentation.

## Railway Deployment

Railway ga deploy qilish uchun:

1. Railway da yangi project yarating
2. GitHub repository ni ulang
3. Environment variables ni sozlang:

```env
# MongoDB (Railway PostgreSQL yoki MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/book-api

# Redis (ixtiyoriy - Redis mavjud bo'lmasa memory store ishlatiladi)
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRE=7d
```

4. Deploy qiling!

**Eslatma**: Redis ixtiyoriy. Agar Redis mavjud bo'lmasa, loyiha memory store bilan ishlaydi.

## Default Configuration

If you don't set environment variables, the application will use these defaults:

- MongoDB: `mongodb://localhost:27017/book-api`
- Redis: `localhost:6379` (ixtiyoriy)
- Port: `8080`
