```markdown
# 📚 D Enskill Academy API Reference (v1.0.0)

> **API Documentation for D Enskill Academy backend student portals, auth, and Paystack payments**  
> **Developed by:** Hilosthone  
> **Server Base URL:** `http://localhost:5000`  
> **Security Scheme:** Bearer Token (`Authorization: Bearer <JWT>`)

---

## 🔐 1. Authentication (`/api/auth`)

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

### Log out a user

* **`POST /api/auth/logout`**
* **Security:** Bearer Auth Required
* **Response (200):** Session cleared successfully.

---

## 💳 2. Enrollments & Paystack (`/api/enrollments`)

### Initialize Payment

* **`POST /api/enrollments/initialize`**
* **Request Body:**
```json
{
  "email": "student@example.com",
  "course": "Full-Stack Web Development",
  "amount": 50000
}

```


* **Response (200):** Returns Paystack authorization URL and reference.

### Verify Transaction

* **`GET /api/enrollments/verify/{reference}`**
* **Parameters:** `reference` (Path, string)
* **Response (200):** Verifies Paystack transaction, updates enrollment status, and activates tracking.

### Set Password After Payment

* **`POST /api/enrollments/set-password`**
* **Request Body:**
```json
{
  "email": "student@example.com",
  "password": "newsecurepassword"
}

```


* **Response (200):** Password configured successfully for newly enrolled student.

---

## 🛡️ 3. Admin Management (`/api/admin`)

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

---

## 🎓 4. Student Dashboard (`/api/dashboard`)

*(Requires Student Bearer Token)*

* **`GET /api/dashboard/overview`** — Get complete student portal data across all tabs (includes assigned tutor info: `tutor_name`, `tutor_email`).
* **`GET /api/dashboard/profile`** — Get student profile details.
* **`GET /api/dashboard/courses`** — Get student enrolled courses with assigned tutors.
* **`GET /api/dashboard/payments`** — Get student payment history.
* **`GET /api/dashboard/announcements`** — Get portal announcements.

```

```