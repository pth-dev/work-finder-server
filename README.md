# Work Finder Server

A streamlined work finder server application built with NestJS, designed for efficient job matching and company management.

## Features

- **User Management**: User registration, authentication, and profile management
- **Company Management**: Company profiles and information management
- **Job Management**: Job posting, searching, and application tracking
- **File Upload**: Support for resume and document uploads
- **Authentication**: JWT-based authentication with Passport
- **API Documentation**: Swagger/OpenAPI documentation
- **Health Checks**: Application health monitoring
- **Database**: MongoDB with Mongoose ODM

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with Passport
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate limiting

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/work-finder
JWT_ACCESS_KEY=your-super-secret-jwt-access-key-change-this-in-production
JWT_ACCESS_EXPIRE=1d
JWT_REFRESH_KEY=your-super-secret-jwt-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
```

## Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/swagger
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Users

- `GET /api/users` - Get all users (paginated)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Companies

- `GET /api/companies` - Get all companies (paginated)
- `GET /api/companies/:id` - Get company by ID
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Jobs

- `GET /api/jobs` - Get all jobs (paginated)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Files

- `POST /api/files/upload` - Upload file

### Health

- `GET /api/health` - Health check

## Docker

```bash
# Build Docker image
docker build -t work-finder-server .

# Run Docker container
docker run -p 3000:3000 work-finder-server
```

## Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # User management module
├── companies/      # Company management module
├── jobs/           # Job management module
├── files/          # File upload module
├── health/         # Health check module
├── common/         # Shared schemas and utilities
├── core/           # Core interceptors and utilities
├── decorator/      # Custom decorators
├── app.module.ts   # Main application module
├── app.controller.ts
├── app.service.ts
└── main.ts         # Application entry point
```

## Development

```bash
# Format code
npm run format

# Lint code
npm run lint

# Build application
npm run build
```

## License

This project is licensed under the UNLICENSED license.
# work-finder-server
