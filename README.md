# Blogging Web App Backend API Documentation

## Base URL
```
http://localhost:{PORT}/api/v1
```

## Authentication
Most endpoints require authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Authentication APIs

### 1. Register User
**Endpoint:** `POST /auth/register`

**Description:** Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `409` - Email already registered

---

### 2. Login
**Endpoint:** `POST /auth/login`

**Description:** Login and get access tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Invalid credentials

---

### 3. Refresh Access Token
**Endpoint:** `POST /auth/refresh-token`

**Description:** Get a new access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token"
  }
}
```

**Error Responses:**
- `400` - Refresh token is required
- `401` - Invalid or expired refresh token

---

### 4. Logout
**Endpoint:** `POST /auth/logout`

**Description:** Logout and invalidate refresh token session.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `400` - Refresh token is required
- `401` - Invalid refresh token

---

## Blog APIs

### 5. Create Blog
**Endpoint:** `POST /blogs`

**Description:** Create a new blog post (logged-in user only).

**Authentication:** Required

**Request Body:**
```json
{
  "heading": "My First Blog Post",
  "description": "This is a detailed description of my blog post. It can contain multiple paragraphs and should be at least 10 characters long.",
  "img": "https://example.com/image.jpg"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "blog_id",
    "heading": "My First Blog Post",
    "description": "This is a detailed description of my blog post...",
    "img": "https://example.com/image.jpg",
    "author": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `401` - Authorization token missing or invalid

---

### 6. Update Blog
**Endpoint:** `PUT /blogs/:blogId`

**Description:** Update an existing blog post (only the author can update).

**Authentication:** Required

**Request Body:** (At least one field required)
```json
{
  "heading": "Updated Blog Heading",
  "description": "Updated description...",
  "img": "https://example.com/new-image.jpg"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "blog_id",
    "heading": "Updated Blog Heading",
    "description": "Updated description...",
    "img": "https://example.com/new-image.jpg",
    "author": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error or no fields provided
- `401` - Authorization token missing or invalid
- `403` - You can only update your own blogs
- `404` - Blog not found

---

### 7. Delete Blog
**Endpoint:** `DELETE /blogs/:blogId`

**Description:** Delete a blog post (only the author can delete).

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

**Error Responses:**
- `401` - Authorization token missing or invalid
- `403` - You can only delete your own blogs
- `404` - Blog not found

---

### 8. Get Other Users' Blogs
**Endpoint:** `GET /blogs`

**Description:** Get all blogs from other users (public endpoint). If user is logged in, excludes their own blogs. If not logged in, shows all blogs.

**Authentication:** Optional

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of blogs per page (default: 10)
- `authorId` (optional): Filter blogs by specific author ID

**Example Request:**
```
GET /blogs?page=1&limit=10
GET /blogs?authorId=user_id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "blogs": [
      {
        "id": "blog_id",
        "heading": "Blog Heading",
        "description": "Blog description...",
        "img": "https://example.com/image.jpg",
        "author": {
          "id": "user_id",
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

### 9. Get My Blogs
**Endpoint:** `GET /blogs/my-blogs`

**Description:** Get all blogs created by the logged-in user.

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of blogs per page (default: 10)

**Example Request:**
```
GET /blogs/my-blogs?page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "blogs": [
      {
        "id": "blog_id",
        "heading": "My Blog Heading",
        "description": "My blog description...",
        "img": "https://example.com/image.jpg",
        "author": {
          "id": "user_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

**Error Responses:**
- `401` - Authorization token missing or invalid

---

## Status Endpoint

### 10. Health Check
**Endpoint:** `GET /status`

**Description:** Check if the server is running.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Healthy"
}
```

---

## Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- Image URLs must be valid URIs
- Blog heading: 3-200 characters
- Blog description: 10-5000 characters
- Pagination is available for list endpoints
- All authenticated endpoints require a valid JWT access token in the Authorization header

