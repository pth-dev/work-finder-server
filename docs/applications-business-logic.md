# Applications Business Logic Validation

## Overview

This document outlines the business logic validation implemented for the Applications API to ensure data integrity and proper workflow management.

## Business Rules Implemented

### 1. Job Application Creation Validation

#### 1.1 Job Existence and Status
- **Rule**: Users can only apply to jobs that exist and are active
- **Validation**: 
  - Check if job exists in database
  - Verify job status is `ACTIVE`
- **Error**: `NotFoundException` if job doesn't exist, `BadRequestException` if job is not active

#### 1.2 Application Deadline
- **Rule**: Users cannot apply after the job's application deadline
- **Validation**: Compare current date with `job.application_deadline`
- **Error**: `BadRequestException` with message "Application deadline has passed for this job"

#### 1.3 Duplicate Application Prevention
- **Rule**: Users cannot apply to the same job multiple times
- **Validation**: Check for existing application with same `user_id` and `job_id`
- **Error**: `ConflictException` with message "You have already applied for this job"

#### 1.4 Resume Ownership
- **Rule**: Users can only use their own resumes for applications
- **Validation**: Verify `resume.user_id` matches `application.user_id`
- **Error**: `BadRequestException` if resume doesn't belong to user

### 2. Application Status Update Validation

#### 2.1 Status Transition Rules
Valid status transitions:

```
PENDING → [REVIEWED, REJECTED, WITHDRAWN]
REVIEWED → [SHORTLISTED, REJECTED, WITHDRAWN]  
SHORTLISTED → [INTERVIEWED, REJECTED, WITHDRAWN]
INTERVIEWED → [OFFERED, REJECTED, WITHDRAWN]
OFFERED → [ACCEPTED, REJECTED, WITHDRAWN]
ACCEPTED → [] (Final state)
REJECTED → [] (Final state)
WITHDRAWN → [] (Final state)
```

#### 2.2 Authorization Rules
- **Recruiters/Admins**: Can update any status except WITHDRAWN
- **Job Seekers**: Can only set status to WITHDRAWN (withdraw application)
- **Job Ownership**: Only the job poster can update applications for their jobs

### 3. Data Integrity Rules

#### 3.1 Required Fields
- `job_id`: Must reference existing job
- `user_id`: Must reference existing user  
- `resume_id`: Must reference existing resume owned by user
- `status`: Defaults to PENDING if not specified

#### 3.2 Timestamps
- `applied_at`: Set automatically on creation
- `updated_at`: Updated automatically on any modification

## API Endpoints Enhanced

### POST /api/v1/applications
**Business Logic Added:**
- Job existence and status validation
- Deadline validation
- Duplicate application prevention
- Resume ownership validation

### PATCH /api/v1/applications/:id
**Business Logic Added:**
- Status transition validation
- Authorization checks based on user role
- Job ownership verification

### GET /api/v1/applications/jobs/:jobId/applications
**New Endpoint for Recruiters:**
- Only job owners can view applications for their jobs
- Supports filtering by status
- Includes pagination

### GET /api/v1/applications/stats
**New Endpoint for Statistics:**
- Job seekers see stats for their applications
- Recruiters see stats for applications to their jobs
- Grouped by status with totals

## Error Handling

### Error Types and Messages

| Error Type | HTTP Status | When Thrown |
|------------|-------------|-------------|
| `NotFoundException` | 404 | Job/User/Resume not found |
| `BadRequestException` | 400 | Invalid status transition, deadline passed, resume ownership |
| `ConflictException` | 409 | Duplicate application |

### Example Error Responses

```json
{
  "statusCode": 400,
  "message": "Application deadline has passed for this job",
  "error": "Bad Request"
}

{
  "statusCode": 409,
  "message": "You have already applied for this job", 
  "error": "Conflict"
}

{
  "statusCode": 400,
  "message": "Invalid status transition from ACCEPTED to PENDING",
  "error": "Bad Request"
}
```

## Database Changes

### New Fields Added
- `applications.user_id`: Direct reference to user for better query performance
- `applications.updated_at`: Track when application was last modified

### New Constraints
- Unique constraint on `(user_id, job_id)` to prevent duplicates
- Foreign key constraint on `user_id`
- Indexes for performance optimization

## Testing

### Unit Tests Included
- Job validation scenarios
- Status transition validation
- Authorization checks
- Error handling verification

### Test Coverage
- Valid application creation
- All validation failure scenarios
- Status transition edge cases
- Authorization boundary testing

## Performance Considerations

### Optimizations Added
- Database indexes on frequently queried fields
- Efficient query patterns with proper joins
- Pagination for large result sets
- Reduced N+1 query problems

### Monitoring Points
- Application creation success/failure rates
- Status transition patterns
- Query performance metrics
- Error frequency by type

## Future Enhancements

### Potential Additions
1. **Application Scoring**: Automatic scoring based on resume match
2. **Bulk Operations**: Bulk status updates for recruiters
3. **Application Templates**: Predefined application workflows
4. **Notification Integration**: Real-time notifications for status changes
5. **Analytics Dashboard**: Advanced reporting and insights
