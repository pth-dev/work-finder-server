# 📚 WorkFinder API - Complete Endpoints Reference

## 🔗 Base URL
```
http://localhost:3000/api/v1
```

## 🔐 Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🏠 **Application Health**

### Health Check
```http
GET /
GET /health
```
- **Description**: Check application status
- **Authentication**: None required
- **Response**: Application health information

---

## 🔐 **Authentication & Authorization**

### Register User
```http
POST /auth/register
```
- **Body**: `{ username, password, email, full_name, role? }`
- **Response**: `{ access_token, refresh_token, user }`

### Login User
```http
POST /auth/login
```
- **Body**: `{ username, password }`
- **Response**: `{ access_token, refresh_token, user }`

### Refresh Token
```http
POST /auth/refresh
```
- **Body**: `{ refresh_token }`
- **Response**: `{ access_token }`

### Logout User
```http
POST /auth/logout
```
- **Authentication**: Required
- **Response**: Success message

### Get Current User
```http
POST /auth/me
```
- **Authentication**: Required
- **Response**: Current user profile

---

## 👥 **User Management**

### Get My Profile
```http
GET /users/me
```
- **Authentication**: Required
- **Response**: Current user profile

### Update My Profile
```http
PATCH /users/me
```
- **Authentication**: Required
- **Body**: `{ full_name?, email?, phone?, address? }`
- **Response**: Updated user profile

### Get All Users (Admin Only)
```http
GET /users/all
```
- **Authentication**: Required (Admin role)
- **Response**: Array of all users

---

## 🏢 **Company Management**

### Create Company
```http
POST /companies
```
- **Authentication**: Required (Recruiter/Admin)
- **Body**: `{ company_name, description?, industry?, website? }`
- **Response**: Created company

### Get All Companies
```http
GET /companies
```
- **Authentication**: None required
- **Query**: `?page=1&limit=10&industry=tech`
- **Response**: Paginated companies list

### Get Company by ID
```http
GET /companies/:id
```
- **Authentication**: None required
- **Response**: Company details

### Update Company
```http
PATCH /companies/:id
```
- **Authentication**: Required (Recruiter/Admin)
- **Body**: Company update data
- **Response**: Updated company

### Delete Company
```http
DELETE /companies/:id
```
- **Authentication**: Required (Admin)
- **Response**: Success message

### Get Company Jobs
```http
GET /companies/:id/jobs
```
- **Authentication**: None required
- **Response**: Jobs posted by the company

### Follow/Unfollow Company
```http
POST /companies/:id/follow
DELETE /companies/:id/follow
```
- **Authentication**: Required
- **Response**: Success message

---

## 💼 **Job Management**

### Create Job
```http
POST /jobs
```
- **Authentication**: Required (Recruiter/Admin)
- **Body**: `{ company_id, job_title, description?, location?, salary?, job_type? }`
- **Response**: Created job

### Get All Jobs
```http
GET /jobs
```
- **Authentication**: None required
- **Query**: `?page=1&limit=10&location=hanoi&job_type=full_time&status=active`
- **Response**: Paginated jobs list

### Get Job by ID
```http
GET /jobs/:id
```
- **Authentication**: None required
- **Response**: Job details with company info

### Update Job
```http
PATCH /jobs/:id
```
- **Authentication**: Required (Recruiter/Admin)
- **Body**: Job update data
- **Response**: Updated job

### Delete Job
```http
DELETE /jobs/:id
```
- **Authentication**: Required (Recruiter/Admin)
- **Response**: Success message

### Save/Unsave Job
```http
POST /jobs/:id/save
DELETE /jobs/:id/save
```
- **Authentication**: Required
- **Response**: Success message

### Get My Saved Jobs
```http
GET /jobs/saved
```
- **Authentication**: Required
- **Response**: User's saved jobs

---

## 📄 **Resume Management**

### Create Resume
```http
POST /resumes
```
- **Authentication**: Required
- **Body**: `{ file_name, file_path }`
- **Response**: Created resume

### Get My Resumes
```http
GET /resumes/my-resumes
```
- **Authentication**: Required
- **Response**: User's resumes

### Get Resume by ID
```http
GET /resumes/:id
```
- **Authentication**: Required
- **Response**: Resume details

### Update Resume
```http
PATCH /resumes/:id
```
- **Authentication**: Required
- **Body**: Resume update data
- **Response**: Updated resume

### Delete Resume
```http
DELETE /resumes/:id
```
- **Authentication**: Required
- **Response**: Success message

---

## 📋 **Application Management**

### Apply for Job
```http
POST /applications
```
- **Authentication**: Required (Job Seeker)
- **Body**: `{ job_id, resume_id }`
- **Response**: Created application

### Get My Applications
```http
GET /applications
```
- **Authentication**: Required
- **Query**: `?status=pending&page=1&limit=10`
- **Response**: User's applications (filtered by role)

### Get Application by ID
```http
GET /applications/:id
```
- **Authentication**: Required
- **Response**: Application details

### Update Application Status
```http
PATCH /applications/:id
```
- **Authentication**: Required
- **Body**: `{ status }`
- **Response**: Updated application
- **Business Rules**: 
  - Recruiters/Admins: Can update to any status except WITHDRAWN
  - Job Seekers: Can only set to WITHDRAWN

### Withdraw Application
```http
DELETE /applications/:id
```
- **Authentication**: Required
- **Response**: Application set to WITHDRAWN status

### Get Job Applications (Recruiter)
```http
GET /applications/jobs/:jobId/applications
```
- **Authentication**: Required (Recruiter/Admin)
- **Query**: `?status=pending&page=1&limit=10`
- **Response**: Applications for specific job

### Get Application Statistics
```http
GET /applications/stats
```
- **Authentication**: Required
- **Response**: Application statistics by status

---

## 📁 **File Upload**

### Upload Avatar
```http
POST /upload/avatar
```
- **Authentication**: Required
- **Body**: `multipart/form-data` with file
- **File Types**: JPG, JPEG, PNG, GIF
- **Max Size**: 5MB
- **Response**: `{ message, filename, url }`

### Upload Resume
```http
POST /upload/resume
```
- **Authentication**: Required
- **Body**: `multipart/form-data` with file
- **File Types**: PDF, DOC, DOCX
- **Max Size**: 10MB
- **Response**: `{ message, resume_id, filename, url }`

### Upload Company Image
```http
POST /upload/company/:companyId/image
```
- **Authentication**: Required (Recruiter/Admin)
- **Body**: `multipart/form-data` with file
- **File Types**: JPG, JPEG, PNG, GIF
- **Max Size**: 5MB
- **Response**: `{ message, filename, url }`

---

## 🔔 **Notifications**

### Get My Notifications
```http
GET /notifications
```
- **Authentication**: Required
- **Response**: User's notifications

### Mark Notification as Read
```http
PATCH /notifications/:id/read
```
- **Authentication**: Required
- **Response**: Updated notification

### Delete Notification
```http
DELETE /notifications/:id
```
- **Authentication**: Required
- **Response**: Success message

---

## 📊 **Status Codes & Error Handling**

### Success Responses
- **200 OK**: Successful GET, PATCH requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests

### Error Responses
- **400 Bad Request**: Invalid input data, business logic violations
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate data (e.g., already applied)
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server errors

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Detailed error message",
  "error": "Bad Request",
  "timestamp": "2025-01-21T08:00:00.000Z",
  "path": "/api/v1/applications"
}
```

---

## 🔄 **Application Status Workflow**

### Valid Status Transitions
```
PENDING → [REVIEWING, REJECTED, WITHDRAWN]
REVIEWING → [INTERVIEW_SCHEDULED, REJECTED, WITHDRAWN]
INTERVIEW_SCHEDULED → [INTERVIEWED, REJECTED, WITHDRAWN]
INTERVIEWED → [ACCEPTED, REJECTED, WITHDRAWN]
ACCEPTED → [] (Final state)
REJECTED → [] (Final state)
WITHDRAWN → [] (Final state)
```

---

## 🎯 **Role-Based Access Control**

### Job Seeker Permissions
- ✅ Apply for jobs
- ✅ View own applications
- ✅ Withdraw own applications
- ✅ Save/unsave jobs
- ✅ Follow companies
- ✅ Upload resumes

### Recruiter Permissions
- ✅ All Job Seeker permissions
- ✅ Create/manage companies
- ✅ Post/manage jobs
- ✅ View job applications
- ✅ Update application status
- ✅ Upload company images

### Admin Permissions
- ✅ All Recruiter permissions
- ✅ View all users
- ✅ Delete companies
- ✅ Manage any application
- ✅ System administration

---

## 📖 **Additional Resources**

- **Swagger Documentation**: `http://localhost:3000/api/docs`
- **Business Logic Guide**: `docs/applications-business-logic.md`
- **Project Analysis**: `docs/project-analysis.md`
- **Test API Collection**: `test-api.http`

---

**Total Endpoints: 45+**
**Authentication Required: 35+**
**Public Endpoints: 10+**
