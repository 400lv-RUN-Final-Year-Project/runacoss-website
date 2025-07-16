# API Endpoints Reference

This document describes the main API endpoints for the RUNACOSS platform, covering News, Repository (Repo), and Blogs. Use these endpoints to connect your frontend, test with Postman/curl, or integrate with other services.

---

## 📰 News Endpoints

**Base path:** `/api/news`

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/api/news`             | Get all news items                 |
| GET    | `/api/news/:id`         | Get a single news item by ID       |
| POST   | `/api/news`             | Create a news item (admin only)    |
| PUT    | `/api/news/:id`         | Update a news item (admin only)    |
| DELETE | `/api/news/:id`         | Delete a news item (admin only)    |

### Example: Get All News
```http
GET http://localhost:5001/api/news
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "newsId1",
      "title": "News Title",
      "content": "News content...",
      "createdAt": "2024-07-14T12:00:00.000Z"
      // ...other fields
    }
  ]
}
```

### Example: Create News (Admin)
```http
POST http://localhost:5001/api/news
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "New News",
  "content": "News content..."
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "newNewsId",
    "title": "New News"
  }
}
```

---

## 📚 Repository (Repo) Endpoints

**Base path:** `/api/repository`

| Method | Endpoint                                      | Description                                 |
|--------|-----------------------------------------------|---------------------------------------------|
| GET    | `/api/repository/files`                       | Get all repository files (with filters)     |
| GET    | `/api/repository/files/:fileId`               | Get a single file by ID                     |
| POST   | `/api/repository/upload`                      | Upload a new file (protected)               |
| PUT    | `/api/repository/files/:fileId`               | Update a file (admin/protected)             |
| DELETE | `/api/repository/files/:fileId`               | Delete a file (admin/protected)             |
| GET    | `/api/repository/category/:category`          | Get files by category                       |
| GET    | `/api/repository/department/:department`      | Get files by department                     |
| GET    | `/api/repository/search?search=...`           | Search files                                |
| GET    | `/api/repository/stats`                       | Get repository statistics                   |
| GET    | `/api/repository/download/:fileId`            | Download a file                             |

### Example: Get All Files
```http
GET http://localhost:5001/api/repository/files
Authorization: Bearer <user_token>
```
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "fileId1",
      "fileName": "example.pdf",
      "category": "past-questions"
      // ...other fields
    }
  ]
}
```

### Example: Upload File
```http
POST http://localhost:5001/api/repository/upload
Authorization: Bearer <user_token>
Content-Type: multipart/form-data

// Form fields: file, category, department, level, semester, etc.
```
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "newFileId",
    "fileName": "uploaded.pdf"
  }
}
```

---

## 📝 Blogs Endpoints

**Base path:** `/api/blogs`

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | `/api/blogs`            | Get all blogs                      |
| GET    | `/api/blogs/:id`        | Get a single blog by ID            |
| POST   | `/api/blogs`            | Create a new blog (protected)      |
| PUT    | `/api/blogs/:id`        | Update a blog (protected/author)   |
| DELETE | `/api/blogs/:id`        | Delete a blog (protected/author)   |

### Example: Get All Blogs
```http
GET http://localhost:5001/api/blogs
```
**Response:**
```json
{
  "success": true,
  "blogs": [
    {
      "_id": "blogId1",
      "title": "Blog Title",
      "content": "Blog content..."
      // ...other fields
    }
  ]
}
```

### Example: Create Blog
```http
POST http://localhost:5001/api/blogs
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "title": "New Blog",
  "content": "Blog content..."
}
```
**Response:**
```json
{
  "success": true,
  "blog": {
    "_id": "newBlogId",
    "title": "New Blog"
  }
}
```

---

## 🔒 Authentication
- For protected endpoints, include the JWT token in the `Authorization` header:
  ```http
  Authorization: Bearer <token>
  ```
- If you get a 401 error, ensure you are logged in and your token is valid.

---

## 🛠️ Notes
- All endpoints return JSON.
- For file uploads, use `multipart/form-data`.
- For admin-only endpoints, use an admin JWT token.
- For more details or custom queries, see the backend route files or ask for a specific endpoint example. 