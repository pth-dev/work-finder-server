# 🗄️ WorkFinder Database Schema

## 📋 Database Entities & Attributes

### 👥 **Users**
**Table Name**: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `user_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | User login name |
| `password` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `full_name` | VARCHAR(100) | NULLABLE | User's full name |
| `email` | VARCHAR(100) | UNIQUE, NULLABLE | User's email address |
| `phone` | VARCHAR(20) | NULLABLE | Phone number |
| `address` | TEXT | NULLABLE | User's address |
| `avatar` | VARCHAR(255) | NULLABLE | Avatar image path |
| `refresh_token` | TEXT | NULLABLE | JWT refresh token |
| `role` | ENUM | NOT NULL, DEFAULT: 'job_seeker' | User role (see UserRole enum) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT: NOW() | Account creation date |

**Relationships**:
- One-to-Many: `resumes`, `saved_jobs`, `followed_companies`, `notifications`, `applications`

---

### 🏢 **Companies**
**Table Name**: `companies`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `company_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique company identifier |
| `company_name` | VARCHAR(200) | NOT NULL | Company name |
| `description` | TEXT | NULLABLE | Company description |
| `company_image` | VARCHAR(255) | NULLABLE | Company logo/image path |
| `industry` | VARCHAR(100) | NULLABLE | Industry sector |
| `website` | VARCHAR(255) | NULLABLE | Company website URL |

**Relationships**:
- One-to-Many: `job_posts`, `followers` (FollowedCompany)

---

### 💼 **Job Posts**
**Table Name**: `job_posts`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `job_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique job identifier |
| `company_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to company |
| `job_title` | VARCHAR(200) | NOT NULL | Job title |
| `description` | TEXT | NULLABLE | Job description |
| `location` | VARCHAR(200) | NULLABLE | Job location |
| `salary` | VARCHAR(100) | NULLABLE | Salary information |
| `job_type` | ENUM | NULLABLE | Job type (see JobType enum) |
| `status` | ENUM | NOT NULL, DEFAULT: 'active' | Job status (see JobStatus enum) |
| `posted_date` | TIMESTAMP | NOT NULL, DEFAULT: NOW() | Job posting date |
| `save_count` | INTEGER | NOT NULL, DEFAULT: 0 | Number of saves |

**Relationships**:
- Many-to-One: `company`
- One-to-Many: `applications`, `saved_by` (SavedJob)

---

### 📄 **Resumes**
**Table Name**: `resumes`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `resume_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique resume identifier |
| `user_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to user |
| `file_name` | VARCHAR(255) | NOT NULL | Original file name |
| `file_path` | VARCHAR(255) | NOT NULL | File storage path |
| `uploaded_at` | TIMESTAMP | NOT NULL, DEFAULT: NOW() | Upload timestamp |

**Relationships**:
- Many-to-One: `user`
- One-to-Many: `applications`

---

### 📋 **Applications**
**Table Name**: `applications`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `application_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique application identifier |
| `job_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to job |
| `resume_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to resume |
| `user_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to user |
| `status` | ENUM | NOT NULL, DEFAULT: 'pending' | Application status (see ApplicationStatus enum) |
| `applied_at` | TIMESTAMP | NOT NULL, DEFAULT: NOW() | Application submission date |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT: NOW() | Last update timestamp |

**Constraints**:
- UNIQUE(`user_id`, `job_id`) - Prevent duplicate applications

**Relationships**:
- Many-to-One: `job_post`, `resume`, `user`
- One-to-Many: `interviews`

---

### 🎯 **Interviews**
**Table Name**: `interviews`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `interview_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique interview identifier |
| `application_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to application |
| `interview_time` | TIMESTAMP | NULLABLE | Scheduled interview time |
| `interview_type` | ENUM | NULLABLE | Interview type (see InterviewType enum) |
| `notes` | TEXT | NULLABLE | Interview notes |

**Relationships**:
- Many-to-One: `application`

---

### 💾 **Saved Jobs**
**Table Name**: `saved_jobs`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `saved_job_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique saved job identifier |
| `user_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to user |
| `job_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to job |
| `saved_at` | TIMESTAMP | NOT NULL, DEFAULT: NOW() | Save timestamp |

**Constraints**:
- UNIQUE(`user_id`, `job_id`) - Prevent duplicate saves

**Relationships**:
- Many-to-One: `user`, `job_post`

---

### 👁️ **Followed Companies**
**Table Name**: `followed_companies`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `followed_company_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique follow identifier |
| `user_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to user |
| `company_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to company |
| `followed_at` | TIMESTAMP | NOT NULL, DEFAULT: NOW() | Follow timestamp |

**Constraints**:
- UNIQUE(`user_id`, `company_id`) - Prevent duplicate follows

**Relationships**:
- Many-to-One: `user`, `company`

---

### 🔔 **Notifications**
**Table Name**: `notifications`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `notification_id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique notification identifier |
| `recipient_id` | INTEGER | FOREIGN KEY, NOT NULL | Reference to user (recipient) |
| `title` | VARCHAR(255) | NOT NULL | Notification title |
| `message` | TEXT | NOT NULL | Notification message |
| `is_read` | BOOLEAN | NOT NULL, DEFAULT: FALSE | Read status |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT: NOW() | Creation timestamp |

**Relationships**:
- Many-to-One: `recipient` (User)

---

## 🏷️ Enums Definition

### **UserRole**
```typescript
enum UserRole {
  JOB_SEEKER = 'job_seeker',
  RECRUITER = 'recruiter', 
  ADMIN = 'admin'
}
```

### **JobType**
```typescript
enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
  TEMPORARY = 'temporary'
}
```

### **JobStatus**
```typescript
enum JobStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CLOSED = 'closed',
  DRAFT = 'draft'
}
```

### **ApplicationStatus**
```typescript
enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEWED = 'interviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}
```

### **InterviewType**
```typescript
enum InterviewType {
  PHONE = 'phone',
  VIDEO = 'video',
  IN_PERSON = 'in_person',
  TECHNICAL = 'technical',
  HR = 'hr',
  FINAL = 'final'
}
```

---

## 🔗 Entity Relationships Summary

### **One-to-Many Relationships**
- `Users` → `Resumes`
- `Users` → `Applications`
- `Users` → `SavedJobs`
- `Users` → `FollowedCompanies`
- `Users` → `Notifications`
- `Companies` → `JobPosts`
- `Companies` → `FollowedCompanies`
- `JobPosts` → `Applications`
- `JobPosts` → `SavedJobs`
- `Resumes` → `Applications`
- `Applications` → `Interviews`

### **Many-to-One Relationships**
- `Resumes` → `Users`
- `Applications` → `Users`, `JobPosts`, `Resumes`
- `SavedJobs` → `Users`, `JobPosts`
- `FollowedCompanies` → `Users`, `Companies`
- `Notifications` → `Users` (recipient)
- `Interviews` → `Applications`
- `JobPosts` → `Companies`

### **Unique Constraints**
- `users.username` - Unique username
- `users.email` - Unique email
- `(saved_jobs.user_id, saved_jobs.job_id)` - Prevent duplicate saves
- `(followed_companies.user_id, followed_companies.company_id)` - Prevent duplicate follows
- `(applications.user_id, applications.job_id)` - Prevent duplicate applications

---

## 📊 Database Statistics

- **Total Tables**: 9
- **Total Enums**: 5
- **Total Relationships**: 11 One-to-Many
- **Unique Constraints**: 5
- **Foreign Keys**: 11

---

## 🔍 Indexes (Recommended)

```sql
-- Performance indexes
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at);
CREATE INDEX idx_job_posts_company_id ON job_posts(company_id);
CREATE INDEX idx_job_posts_status ON job_posts(status);
CREATE INDEX idx_job_posts_posted_date ON job_posts(posted_date);
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
```
