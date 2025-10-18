# JWT Authentication Usage Guide

## Overview
This application uses JWT (JSON Web Tokens) for authentication instead of HTTP Basic Auth.

## What is JWT?
JWT is a secure way to transmit information between parties as a JSON object. It consists of three parts:
1. **Header**: Token type and signing algorithm
2. **Payload**: Claims (user data)
3. **Signature**: Ensures token hasn't been tampered with

## Authentication Flow
```
Front end Example
localStorage.setItem('token', response.data.token);
```
```
GET /assets
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
```
fetch('http://localhost:8080/assets', {
headers: {
'Authorization': `Bearer ${localStorage.getItem('token')}`
}
})
```
```
localStorage.removeItem('token');
```
### 1. Login
```http
POST /auth/login
Content-Type: application/json
{
  "username": "john_doe",
  "password": "password123"
}
```