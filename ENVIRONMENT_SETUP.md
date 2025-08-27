# Environment Setup Guide

## Required Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp backend/.env.example backend/.env
```

### Database Configuration
- **DB_HOST**: PostgreSQL host (default: localhost)
- **DB_PORT**: PostgreSQL port (default: 5432)
- **DB_NAME**: Database name (default: mental_health_db)
- **DB_USER**: PostgreSQL username
- **DB_PASSWORD**: PostgreSQL password

### JWT Configuration
- **JWT_SECRET**: Secret key for JWT tokens (use a long, random string)

### MongoDB Configuration (Optional)
- **MONGO_URI**: MongoDB connection string for chat features

### Stripe Configuration (For Payment Processing)
- **STRIPE_SECRET_KEY**: Your Stripe secret key from Stripe Dashboard

### Server Configuration
- **PORT**: Server port (default: 5000)

## Setup Instructions

1. Install PostgreSQL and create the database
2. Copy and configure the `.env` file
3. Run `npm install` in both backend and frontend directories
4. Start the backend: `cd backend && npm run dev`
5. Start the frontend: `cd frontend && npm run dev`

## Security Notes

- Never commit `.env` files to version control
- Use environment-specific configurations for production
- Rotate API keys regularly
- Use strong, unique passwords for database access
