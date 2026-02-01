Looking at the MVP feature list, here's a comprehensive breakdown of all necessary services and API routes:

## 📋 **SERVICE LAYER** (`src/services/`)

### **1. student.ts**

```typescript
// Student-specific business logic
- getStudentDashboard(studentId, sessionId?)
- getStudentProfile(studentId)
- updateStudentProfile(studentId, data)
- getStudentSessions(studentId)
- switchActiveSession(studentId, sessionId)
- getStudentAlerts(studentId)
```

### **2. logbook.ts**

```typescript
// Weekly logbook management
-getLogbookWeeks(studentId, sessionId) -
  getWeekDetails(weekId) -
  createWeekEntry(weekId, dayOfWeek, content) -
  updateWeekEntry(entryId, content) -
  deleteWeekEntry(entryId) -
  uploadWeeklyDiagram(weekId, file) -
  deleteWeeklyDiagram(weekId) -
  requestWeekReview(weekId) - // triggers industry supervisor notification
  isWeekLocked(weekId);
```

### **3. review.ts**

```typescript
// Comment and review management
- getWeekComments(weekId)
- addIndustryComment(weekId, supervisorId, comment)
- addSchoolComment(weekId, supervisorId, comment)
- lockWeek(weekId, supervisorId)
- unlockWeek(weekId, supervisorId)
- addFinalComment(studentId, supervisorId, comment, type: 'industry'|'school')
- getFinalComments(studentId)
```

### **4. siwes-detail.ts**

```typescript
// SIWES details management
-getSiwesDetails(studentId) -
  createOrUpdateSiwesDetails(studentId, data) -
  createIndustrySupervisorFromDetails(data); // auto-creates supervisor record
```

### **5. pdf-generator.ts**

```typescript
// PDF generation service
-generateLogbookPDF(studentId, sessionId) -
  previewLogbookPDF(studentId, sessionId);
```

### **6. supervisor.ts**

```typescript
// Supervisor operations (both types)
-getIndustrySupervisorDashboard(supervisorId) -
  getSchoolSupervisorDashboard(supervisorId) -
  getSupervisorProfile(supervisorId, type) -
  updateSupervisorProfile(supervisorId, type, data) -
  getAssignedStudents(supervisorId, type) -
  getStudentWeekForReview(studentId, weekId, supervisorId);
```

### **7. admin-dashboard.ts**

```typescript
// Admin dashboard statistics
-getDashboardStats() -
  getRecentActivities(limit) -
  getActiveSessions() -
  getSystemMetrics();
```

### **8. admin-user.ts**

```typescript
// Admin user management
-getAllAdmins() -
  getAdminById(adminId) -
  createAdmin(data) -
  updateAdmin(adminId, data) -
  deleteAdmin(adminId) -
  toggleAdminStatus(adminId);
```

### **9. session.ts**

```typescript
// SIWES session management
-getAllSessions() -
  getSessionById(sessionId) -
  createSession(data) -
  updateSession(sessionId, data) -
  closeSession(sessionId) -
  getActiveSession();
```

### **10. department.ts**

```typescript
// Department and faculty management
-getAllFaculties() -
  createFaculty(data) -
  updateFaculty(facultyId, data) -
  deleteFaculty(facultyId) -
  getDepartmentsByFaculty(facultyId) -
  createDepartment(data) -
  updateDepartment(deptId, data) -
  deleteDepartment(deptId);
```

### **11. organization.ts**

```typescript
// Placement organization management
-getAllOrganizations(filters) -
  getOrganizationById(orgId) -
  createOrganization(data) -
  updateOrganization(orgId, data) -
  deleteOrganization(orgId) -
  bulkUploadOrganizations(file) -
  downloadOrganizationTemplate();
```

### **12. student-management.ts**

```typescript
// Student CRUD (admin perspective)
-getAllStudents(filters) -
  getStudentById(studentId) -
  createStudent(data) -
  updateStudent(studentId, data) -
  deleteStudent(studentId) -
  bulkUploadStudents(file) -
  downloadStudentTemplate();
```

### **13. supervisor-management.ts**

```typescript
// School supervisor CRUD (admin perspective)
-getAllSchoolSupervisors(filters) -
  getSchoolSupervisorById(supervisorId) -
  createSchoolSupervisor(data) -
  updateSchoolSupervisor(supervisorId, data) -
  deleteSchoolSupervisor(supervisorId) -
  bulkUploadSchoolSupervisors(file) -
  downloadSchoolSupervisorTemplate();
```

### **14. assignment.ts**

```typescript
// Student-supervisor assignment
-getAssignments(sessionId) -
  manualAssignment(studentId, supervisorId) -
  autoAssignByDepartment(sessionId, criteria) -
  unassignStudent(studentId) -
  getSupervisorWorkload(supervisorId);
```

### **15. enrollment.ts**

```typescript
// Session enrollment management
- getSessionEnrollments(sessionId)
- addStudentToSession(studentId, sessionId)
- removeStudentFromSession(studentId, sessionId)
- addSupervisorToSession(supervisorId, sessionId)
- removeSupervisorFromSession(supervisorId, sessionId)
- bulkEnrollStudents(sessionId, studentIds[])
- bulkEnrollSupervisors(sessionId, supervisorIds[])
```

---

## 🛣️ **API ROUTES** (`src/app/api/`)

### **Student Routes**

```
GET    /api/student/dashboard?sessionId={id}
GET    /api/student/profile
PATCH  /api/student/profile
GET    /api/student/sessions
POST   /api/student/sessions/switch
GET    /api/student/alerts

GET    /api/student/siwes-details
POST   /api/student/siwes-details
PATCH  /api/student/siwes-details

GET    /api/student/logbook?sessionId={id}
GET    /api/student/logbook/weeks/{weekId}
POST   /api/student/logbook/weeks/{weekId}/entries
PATCH  /api/student/logbook/entries/{entryId}
DELETE /api/student/logbook/entries/{entryId}

POST   /api/student/logbook/weeks/{weekId}/diagram (multipart)
DELETE /api/student/logbook/weeks/{weekId}/diagram

POST   /api/student/logbook/weeks/{weekId}/request-review
GET    /api/student/logbook/weeks/{weekId}/comments

POST   /api/student/logbook/pdf/generate
GET    /api/student/logbook/pdf/preview

POST   /api/student/password/change
```

### **Industry Supervisor Routes**

```
GET    /api/industry-supervisor/dashboard
GET    /api/industry-supervisor/profile
PATCH  /api/industry-supervisor/profile
PATCH  /api/industry-supervisor/email

GET    /api/industry-supervisor/students
GET    /api/industry-supervisor/students/{studentId}
GET    /api/industry-supervisor/students/{studentId}/weeks/{weekId}
POST   /api/industry-supervisor/students/{studentId}/weeks/{weekId}/comment
POST   /api/industry-supervisor/students/{studentId}/final-comment
```

### **School Supervisor Routes**

```
GET    /api/school-supervisor/dashboard
GET    /api/school-supervisor/profile
PATCH  /api/school-supervisor/profile

GET    /api/school-supervisor/students
GET    /api/school-supervisor/students/{studentId}
GET    /api/school-supervisor/students/{studentId}/weeks/{weekId}
POST   /api/school-supervisor/students/{studentId}/weeks/{weekId}/comment
POST   /api/school-supervisor/students/{studentId}/weeks/{weekId}/lock
POST   /api/school-supervisor/students/{studentId}/weeks/{weekId}/unlock
POST   /api/school-supervisor/students/{studentId}/final-comment

POST   /api/school-supervisor/password/change
```

### **Admin Routes**

```
GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/activities

GET    /api/admin/admins
POST   /api/admin/admins
GET    /api/admin/admins/{adminId}
PATCH  /api/admin/admins/{adminId}
DELETE /api/admin/admins/{adminId}
PATCH  /api/admin/admins/{adminId}/status

GET    /api/admin/sessions
POST   /api/admin/sessions
GET    /api/admin/sessions/{sessionId}
PATCH  /api/admin/sessions/{sessionId}
POST   /api/admin/sessions/{sessionId}/close

GET    /api/admin/faculties
POST   /api/admin/faculties
PATCH  /api/admin/faculties/{facultyId}
DELETE /api/admin/faculties/{facultyId}

GET    /api/admin/departments
POST   /api/admin/departments
PATCH  /api/admin/departments/{deptId}
DELETE /api/admin/departments/{deptId}

GET    /api/admin/organizations
POST   /api/admin/organizations
GET    /api/admin/organizations/{orgId}
PATCH  /api/admin/organizations/{orgId}
DELETE /api/admin/organizations/{orgId}
POST   /api/admin/organizations/bulk-upload (multipart)
GET    /api/admin/organizations/template/download

GET    /api/admin/students
POST   /api/admin/students
GET    /api/admin/students/{studentId}
PATCH  /api/admin/students/{studentId}
DELETE /api/admin/students/{studentId}
POST   /api/admin/students/bulk-upload (multipart)
GET    /api/admin/students/template/download

GET    /api/admin/school-supervisors
POST   /api/admin/school-supervisors
GET    /api/admin/school-supervisors/{supervisorId}
PATCH  /api/admin/school-supervisors/{supervisorId}
DELETE /api/admin/school-supervisors/{supervisorId}
POST   /api/admin/school-supervisors/bulk-upload (multipart)
GET    /api/admin/school-supervisors/template/download

GET    /api/admin/assignments?sessionId={id}
POST   /api/admin/assignments/manual
POST   /api/admin/assignments/auto
DELETE /api/admin/assignments/{assignmentId}

GET    /api/admin/enrollments?sessionId={id}
POST   /api/admin/enrollments/students
DELETE /api/admin/enrollments/students/{enrollmentId}
POST   /api/admin/enrollments/supervisors
DELETE /api/admin/enrollments/supervisors/{enrollmentId}
POST   /api/admin/enrollments/bulk-students
POST   /api/admin/enrollments/bulk-supervisors
```

---

## 📊 **Summary**

**Services Required:** 15 service modules
**API Endpoints:** ~80 routes

**Key Patterns:**

- RESTful design with proper HTTP methods
- Role-based route prefixes (`/api/student/*`, `/api/admin/*`, etc.)
- Bulk operations for admin efficiency
- Template downloads for bulk uploads
- Multipart routes for file uploads (diagrams, CSV files)
- Query parameters for filtering and session switching

**Next Steps:**

1. Create service layer modules in `src/services/`
2. Implement repository layer integration with Prisma
3. Build API routes in `src/app/api/` with middleware
4. Add proper error handling and validation
5. Implement file upload handling for diagrams and bulk CSVs
6. Create PDF generation pipeline
7. Add email notifications via existing mailer
