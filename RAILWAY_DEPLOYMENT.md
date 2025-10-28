<!-- @format -->

# Railway Deployment Guide

## Railway ga Deploy Qilish

### 1. Railway da Project Yaratish

1. [Railway.app](https://railway.app) ga kiring
2. "New Project" ni bosing
3. "Deploy from GitHub repo" ni tanlang
4. GitHub repository ni ulang

### 2. Environment Variables Sozlash

Railway dashboard da "Variables" tab ga o'ting va quyidagi environment variables ni qo'shing:

```env
PORT=3000
NODE_ENV=production

# MongoDB (MongoDB Atlas yoki Railway PostgreSQL)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/book-api

# Redis (ixtiyoriy - Redis mavjud bo'lmasa memory store ishlatiladi)
REDIS_HOST=your-redis-host.railway.app
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRE=7d
```

### 3. Database Sozlash

#### MongoDB Atlas (Tavsiya etiladi)

1. [MongoDB Atlas](https://cloud.mongodb.com) da account yarating
2. Cluster yarating
3. Database user yarating
4. Connection string ni oling va `MONGODB_URI` ga qo'shing

#### Railway PostgreSQL (Alternative)

1. Railway da "New" > "Database" > "PostgreSQL" ni tanlang
2. Connection string ni oling
3. `MONGODB_URI` ni PostgreSQL connection string bilan almashtiring

### 4. Redis Sozlash (ixtiyoriy)

#### Railway Redis

1. Railway da "New" > "Database" > "Redis" ni tanlang
2. Connection details ni oling
3. Environment variables ni sozlang

#### Redis mavjud bo'lmasa

Loyiha avtomatik ravishda memory store bilan ishlaydi. Redis bo'lmasa ham loyiha to'liq ishlaydi.

### 5. Deploy Qilish

1. Railway da "Deploy" ni bosing
2. Build jarayonini kuting
3. Deploy tugagach, URL ni oling

### 6. Test Qilish

Deploy tugagach, quyidagi URL larni test qiling:

- **API**: `https://your-app.railway.app/`
- **Documentation**: `https://your-app.railway.app/api-docs`
- **Books API**: `https://your-app.railway.app/api/books`

## Xususiyatlar

- ✅ **MongoDB Integration** - To'liq CRUD operatsiyalar
- ✅ **JWT Authentication** - Xavfsiz foydalanuvchi autentifikatsiyasi
- ✅ **Redis Caching** - Performance optimallashtirish (ixtiyoriy)
- ✅ **Rate Limiting** - DDoS himoyasi
- ✅ **Swagger Documentation** - API dokumentatsiyasi
- ✅ **Error Handling** - To'liq xato boshqaruvi
- ✅ **Production Ready** - Railway uchun optimallashtirilgan

## Troubleshooting

### Redis Connection Error

Agar Redis connection xatosi bo'lsa:

1. Redis service ni Railway da qo'shing
2. Environment variables ni to'g'ri sozlang
3. Yoki Redis ni o'chirib tashlang (memory store ishlatiladi)

### MongoDB Connection Error

1. MongoDB Atlas connection string ni tekshiring
2. Database user permissions ni tekshiring
3. Network access rules ni tekshiring

### Port Error

Railway avtomatik ravishda PORT environment variable ni o'rnatadi. Agar muammo bo'lsa, `PORT=3000` ni qo'shing.
