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

## Default Configuration

If you don't set the `MONGODB_URI` environment variable, the application will use the default local MongoDB connection: `mongodb://localhost:27017/book-api`
