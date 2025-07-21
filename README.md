# 🚀 WorkFinder API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
</p>

<p align="center">
  <strong>A comprehensive job recruitment platform API built with NestJS</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#installation">Installation</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#database-schema">Database</a> •
  <a href="#deployment">Deployment</a>
</p>

---

## 📋 Description

WorkFinder API is a full-featured job recruitment platform backend that connects job seekers with employers. Built with NestJS, TypeScript, and PostgreSQL, it provides a robust foundation for modern job portal applications with comprehensive business logic validation, role-based access control, and real-time features.

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with access & refresh tokens
- **Role-based access control** (Job Seeker, Recruiter, Admin)
- **Secure password hashing** with bcrypt
- **Token refresh mechanism** for seamless user experience

### 👥 User Management
- **Multi-role user system** (Job Seekers, Recruiters, Admins)
- **Profile management** with avatar upload
- **Account registration & login**
- **User data validation** and sanitization

### 🏢 Company Management
- **Company profiles** with detailed information
- **Company image uploads**
- **Industry categorization**
- **Company following system** for job seekers

### 💼 Job Management
- **Job posting** with rich descriptions
- **Job categorization** (Full-time, Part-time, Contract, etc.)
- **Job status management** (Active, Inactive, Closed, Draft)
- **Job search and filtering**
- **Job saving/bookmarking** functionality
- **Location-based job listings**

### 📄 Application Management
- **Smart application system** with business logic validation
- **Application status workflow** (Pending → Reviewing → Interview → Accepted/Rejected)
- **Duplicate application prevention**
- **Resume ownership validation**
- **Application statistics and analytics**
- **Recruiter dashboard** for managing applications

### 📋 Resume Management
- **Resume upload** (PDF, DOC, DOCX support)
- **Multiple resume support** per user
- **File validation** and security checks
- **Resume metadata storage**

### 🎯 Interview Management
- **Interview scheduling** system
- **Multiple interview types** (Phone, Video, In-person, Technical, HR, Final)
- **Interview notes** and feedback
- **Interview tracking** per application

### 🔔 Notification System
- **Real-time notifications** structure
- **User-specific notifications**
- **Notification management**

### 📁 File Upload System
- **Secure file uploads** with validation
- **Multiple file type support**
- **File size limitations**
- **Organized file storage**

## 🛠 Tech Stack

### Backend Framework
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Node.js** - Runtime environment

### Database
- **PostgreSQL** - Primary database
- **TypeORM** - Object-Relational Mapping

### Authentication & Security
- **JWT** - JSON Web Tokens
- **Passport.js** - Authentication middleware
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

### File Handling
- **Multer** - File upload middleware
- **File validation** - Type and size validation

### Documentation & Testing
- **Swagger/OpenAPI** - API documentation
- **Jest** - Testing framework
- **Class Validator** - DTO validation
- **Class Transformer** - Data transformation

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks (if configured)

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd api-new
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=workfinder_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRES_IN=7d

# Application Configuration
PORT=3000
API_PREFIX=api/v1

# File Upload Configuration
UPLOAD_DEST=./uploads
MAX_FILE_SIZE=10485760  # 10MB
```

### 4. Database Setup
```bash
# Create database
createdb workfinder_db

# Run migrations (if available)
npm run migration:run
```

### 5. Start the application
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## 📚 API Documentation

### Swagger Documentation
Once the application is running, visit:
- **Swagger UI**: `http://localhost:3000/api/docs`
- **OpenAPI JSON**: `http://localhost:3000/api/docs-json`

### API Base URL
```
http://localhost:3000/api/v1
```

### Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🗄 Database Schema

### Core Entities

#### Users
- **user_id** (Primary Key)
- **username** (Unique)
- **email** (Unique)
- **password** (Hashed)
- **full_name**
- **phone**
- **address**
- **avatar**
- **role** (job_seeker, recruiter, admin)
- **refresh_token**
- **created_at**

#### Companies
- **company_id** (Primary Key)
- **company_name**
- **description**
- **company_image**
- **industry**
- **website**

#### Job Posts
- **job_id** (Primary Key)
- **company_id** (Foreign Key)
- **job_title**
- **description**
- **location**
- **salary**
- **job_type** (full_time, part_time, contract, freelance, internship, temporary)
- **status** (active, inactive, closed, draft)
- **posted_date**
- **save_count**

#### Applications
- **application_id** (Primary Key)
- **job_id** (Foreign Key)
- **user_id** (Foreign Key)
- **resume_id** (Foreign Key)
- **status** (pending, reviewing, interview_scheduled, interviewed, accepted, rejected, withdrawn)
- **applied_at**
- **updated_at**

#### Resumes
- **resume_id** (Primary Key)
- **user_id** (Foreign Key)
- **file_name**
- **file_path**
- **uploaded_at**

### Relationships
- **Users** → **Resumes** (One-to-Many)
- **Users** → **Applications** (One-to-Many)
- **Users** → **SavedJobs** (One-to-Many)
- **Users** → **FollowedCompanies** (One-to-Many)
- **Companies** → **JobPosts** (One-to-Many)
- **JobPosts** → **Applications** (One-to-Many)
- **Applications** → **Interviews** (One-to-Many)

## 🔧 Development

### Running Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format
```

### Build
```bash
npm run build
```

## 📊 Business Logic & Validation

### Application Workflow
1. **Job Seeker** applies for a job with their resume
2. **System** validates:
   - Job exists and is active
   - No duplicate applications
   - Resume belongs to the applicant
3. **Recruiter** reviews applications and updates status
4. **Status transitions** follow business rules:
   - `PENDING` → `REVIEWING` → `INTERVIEW_SCHEDULED` → `INTERVIEWED` → `ACCEPTED/REJECTED`
   - `WITHDRAWN` can be set by applicant at any time

### Security Features
- **Password hashing** with bcrypt
- **JWT token validation** on protected routes
- **Role-based access control** for sensitive operations
- **File upload validation** (type, size, security)
- **SQL injection prevention** with TypeORM
- **XSS protection** with input validation

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in production:
- Database credentials
- JWT secrets (use strong, unique keys)
- File upload configurations
- CORS settings

### Production Considerations
- Use environment-specific configurations
- Set up proper logging
- Configure reverse proxy (Nginx)
- Set up SSL certificates
- Configure database connection pooling
- Set up monitoring and health checks

### Docker Deployment (Optional)
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📈 Performance & Monitoring

### Database Optimization
- **Indexes** on frequently queried fields
- **Pagination** for large datasets
- **Efficient queries** with proper joins
- **Connection pooling** for database connections

### Caching Strategy
- Consider implementing Redis for session storage
- Cache frequently accessed data
- Implement query result caching

### Monitoring
- Set up application performance monitoring
- Log important business events
- Monitor database performance
- Track API response times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [API Documentation](http://localhost:3000/api/docs)
- Review the [Business Logic Documentation](docs/applications-business-logic.md)

---

<p align="center">
  Made with ❤️ using NestJS
</p>
