# 🔔 Test Notification Triggers

## ✅ **Event Triggers Đã Implement**

### **1. Application Created → Notify Recruiter**

```typescript
// Trigger: Khi user ứng tuyển job
// Location: applications.service.ts - create method
// Notification: "Nguyễn Văn A đã ứng tuyển vào vị trí 'Frontend Developer'"
```

### **2. Application Status Updated → Notify Applicant**

```typescript
// Trigger: Khi recruiter thay đổi status application
// Location: applications.service.ts - update method
// Notification: "Trạng thái ứng tuyển 'Frontend Developer' đã được cập nhật: Đang xem xét"
```

### **3. Job Posted/Activated → Notify Company Followers**

```typescript
// Trigger: Khi job được tạo với status ACTIVE hoặc status chuyển thành ACTIVE
// Location: jobs.service.ts - create & update methods
// Notification: "Sacombank vừa đăng tin tuyển dụng: 'Backend Developer'"
// Recipients: Chỉ những users đang follow công ty đó
```

## 🧪 **Test Cases**

### **Test 1: Job Application Notification**

1. Login as job_seeker
2. Apply to any job
3. Check notifications for recruiter/admin users
4. Expected: "User đã ứng tuyển vào vị trí 'Job Title'"

### **Test 2: Application Status Update**

1. Login as recruiter/admin
2. Update application status (pending → reviewing)
3. Check notifications for applicant
4. Expected: "Trạng thái ứng tuyển 'Job Title' đã được cập nhật: Đang xem xét"

### **Test 3: New Job Posted**

1. Login as job_seeker and follow a company
2. Login as recruiter/admin of that company
3. Create new job with status ACTIVE
4. Check notifications for company followers only
5. Expected: "Company vừa đăng tin tuyển dụng: 'Job Title'"

### **Test 4: Job Activation**

1. Ensure some users are following the company
2. Login as admin
3. Change job status from PENDING → ACTIVE
4. Check notifications for company followers only
5. Expected: "Company vừa đăng tin tuyển dụng: 'Job Title'"

## 📋 **API Endpoints để Test**

### **Get Notifications**

```bash
GET /api/v1/notifications
Authorization: Bearer <token>
```

### **Get Unread Count**

```bash
GET /api/v1/notifications/unread-count
Authorization: Bearer <token>
```

### **Mark as Read**

```bash
PUT /api/v1/notifications/:id/read
Authorization: Bearer <token>
```

## 🎯 **Expected Results**

1. ✅ Notifications được tạo tự động khi có events
2. ✅ Notifications hiển thị đúng content tiếng Việt
3. ✅ Notifications gửi đến đúng recipients
4. ✅ Error handling không làm crash business logic
5. ✅ Console logs hiển thị notification activities

## 🔧 **Next Steps**

1. **Real-time Notifications**: WebSocket/SSE
2. **Email Notifications**: Enable email service
3. **Smart Matching**: AI-based job matching
4. **Notification Preferences**: User settings
5. **Push Notifications**: Mobile support
