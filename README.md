```markdown
# 📚 D Enskill Academy API Reference (v1.0.0)

> **API Documentation for D Enskill Academy backend student portals, auth, and Paystack payments**  
> **Developed by:** Hilosthone  
> **Server Base URL:** `http://localhost:5000`  
> **Security Scheme:** Bearer Token (`Authorization: Bearer <JWT>`)

---

## 💳 1. Enrollments (`/api/enrollments`)

### Register student details and initialize Paystack payment
* **`POST /api/enrollments/initialize`**
* **Request Body:**
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "country": "Nigeria",
    "phone": "08012345678",
    "email": "student@example.com",
    "course": "Full-Stack Web Development",
    "amountPaid": 20000,
    "callback_url": "http://localhost:3000/student/dashboard"
  }

```

* **Response (200):** Returns Paystack authorization URL and reference.

### Initialize subsequent installment payment for a logged-in student

* **`POST /api/enrollments/pay-installment`**
* **Security:** Bearer Auth Required
* **Request Body:**
```json
{
  "course": "Mobile Development",
  "amountPayable": 20000,
  "callback_url": "http://localhost:3000/student/dashboard"
}

```


* **Response (200):** Returns Paystack authorization URL, reference, and remaining balance.

### Verify Paystack transaction and finalize enrollment tracking

* **`GET /api/enrollments/verify/{reference}`**
* **Parameters:** `reference` (Path, string)
* **Response (302/200):** Verifies Paystack transaction, updates enrollment status, and redirects back to frontend dashboard.

### Set password after successful enrollment payment

* **`POST /api/enrollments/set-password`**
* **Request Body:**
```json
{
  "email": "student@example.com",
  "password": "newsecurepassword",
  "confirmPassword": "newsecurepassword"
}

```


* **Response (200):** Password configured successfully for newly enrolled student.

---

## 💰 2. Payments (`/api/payments`)

### Get all system payment logs

* **`GET /api/payments`**
* **Security:** Bearer Auth / Admin Required
* **Response (200):** Returns list of all platform payment records.

---

## 🔐 3. Signup & Login (`/api/auth`)

### Register a new user

* **`POST /api/auth/signup`**
* **Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}

```


* **Response (201):** Returns success status and created user object.

### Log in a user

* **`POST /api/auth/signin`**
* **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}

```


* **Response (200):** Returns access token (`JWT`) and user info.

### Request password reset OTP

* **`POST /api/auth/forgot-password`**
* **Request Body:**
```json
{
  "email": "john@example.com"
}

```


* **Response (200):** Sends a 6-digit OTP to the registered email address.

### Reset password using OTP

* **`POST /api/auth/reset-password`**
* **Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newsecurepassword123",
  "confirmPassword": "newsecurepassword123"
}

```


* **Response (200):** Password reset successfully.

### Log out a user

* **`POST /api/auth/logout`**
* **Security:** Bearer Auth Required
* **Response (200):** Session cleared successfully.

---

## 🎓 4. Student Dashboard (`/api/dashboard`)

*(Requires Student Bearer Token)*

* **`GET /api/dashboard/overview`** — Get complete student portal data across all tabs (includes assigned tutor info: `tutor_name`, `tutor_email`).
* **`GET /api/dashboard/profile`** — Get student profile details.
* **`GET /api/dashboard/courses`** — Get student enrolled courses with assigned tutors.
* **`GET /api/dashboard/payments`** — Get student payment history.
* **`GET /api/dashboard/announcements`** — Get portal announcements.

---

## 🛡️ 5. Admin Management (`/api/admin`)

*(Requires Admin Bearer Token)*

* **`GET /api/admin/dashboard`** — Get admin metrics and recent enrollments.
* **`GET /api/admin/students`** — Get all registered students.
* **`PUT /api/admin/users/{id}/status`** — Freeze or unfreeze a student account (`status`: `"active"` or `"frozen"`).
* **`DELETE /api/admin/users/{id}`** — Delete a student account.
* **`GET /api/admin/payments`** — Get all system payment logs.
* **`GET /api/admin/courses`** — Get all courses with enrollment counts.
* **`PATCH /api/admin/courses/{courseId}/assign-tutor`** — Assign a tutor to a course (`tutorId` / `tutor_id`).
* **`GET /api/admin/announcements`** — Get all system announcements.
* **`POST /api/admin/announcements`** — Create a new announcement (`title`, `content`).
* **`GET /api/admin/instructors`** — Get system instructors.
* **`GET /api/admin/reports`** — Get system performance reports.
* **`GET /api/admin/settings`** — Get platform settings.

```

```