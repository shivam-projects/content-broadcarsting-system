# 📡 Content Broadcasting System (Backend)

## 🚀 Overview

This project is a backend system where teachers upload subject-based content, which is approved by a principal and then broadcasted to students through a public API.

The system supports authentication, approval workflow, and time-based content rotation.

---

## 🛠️ Tech Stack

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication
* bcrypt
* Multer
* Express Rate Limit

---

## 📦 Features

### 🔐 Authentication & RBAC

* JWT-based authentication
* Role-based access control (Teacher / Principal)

### 📤 Content Upload

* Teachers upload content with subject and time window
* File validation (jpg, png, gif)
* File size restriction

### ✅ Approval Workflow

* Only principal can approve/reject content
* Rejection requires reason
* Only approved content goes live

### 🔄 Scheduling & Rotation

* Subject-based grouping
* Duration-based rotation
* Stateless time-based logic

### 🌐 Public API

* Public endpoint (no authentication required)
* Teacher-specific content broadcast
* Returns only active content

### 🛡️ Security

* Input validation
* JWT protection
* Rate limiting

---

## ⚙️ Setup Instructions

```bash
git clone <your-repo-link>
cd project
npm install
```

Create `.env` file:

```
DB_URL=your_database_url
JWT_SECRET=your_secret
```

Run server:

```bash
npm start
```

---

## 🚀 Deployment

The backend is deployed on Render:

https://content-broadcarsting-system.onrender.com

## 🔗 API Endpoints

### Auth

* POST /auth/register
* POST /auth/login

### Content

* POST /content/upload
* GET /content/live/:teacherId?subject=maths

### Approval

* POST /approval/action/:id

---

## 🔄 Scheduling Logic

The system uses time-based rotation:

* Total duration is calculated
* Current time is mapped using modulo
* Content is selected using cumulative duration

This ensures continuous looping without storing state.

---

## ⚠️ Edge Cases

* No content → empty response
* Invalid subject → empty response
* Outside time window → not shown
* Only approved content is visible

---

## 📌 Assumptions

* Student authentication is not required
* Broadcasting is teacher-specific


## 🌐 Live API Example

```http
GET https://content-broadcarsting-system.onrender.com/content/live/1?subject=maths

## ⚠️ File Storage Note

Uploaded files are stored locally. Since the application is deployed on Render (which uses ephemeral storage), uploaded files may not persist after redeployment.

In a production environment, cloud storage solutions like AWS S3 or Cloudinary should be used for reliable file handling.