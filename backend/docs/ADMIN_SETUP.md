# Admin Setup Guide

## 🔐 Admin Registration Limit

The system is configured to allow **maximum 2 admin accounts** for security purposes.

## 📝 How to Register Admin

### Option 1: Using Swagger UI

1. Open Swagger UI: `http://localhost:5005/api/docs`
2. Find **Admin** section
3. Click on **POST /api/admin/register**
4. Click **"Try it out"**
5. Fill in the details:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```
6. Click **"Execute"**

### Option 2: Using cURL

```bash
curl -X POST http://localhost:5005/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "AdminPass123"
  }'
```

### Option 3: Using PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:5005/api/admin/register" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"name":"Admin User","email":"admin@example.com","password":"AdminPass123"}'
```

## 🔑 Admin Login

### Using Swagger UI

1. Find **POST /api/admin/login**
2. Click **"Try it out"**
3. Enter credentials:
```json
{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```
4. Click **"Execute"**
5. Copy the token from the response
6. Click **"Authorize"** button (🔒 icon)
7. Paste the token
8. Click **"Authorize"** then **"Close"**

## 👥 Current Admin Accounts

You already have 1 admin registered:
- **Email**: `admin@test.com`
- **Password**: `AdminPass123`

You can register **1 more admin** (limit: 2 total).

## ⚠️ Admin Limit Reached

If you try to register a 3rd admin, you'll get:
```json
{
  "success": false,
  "message": "Admin registration limit reached. Maximum 2 admins allowed."
}
```

## 🔓 Admin Capabilities

With admin token, you can:
- ✅ View all pending events: `GET /api/events/pending`
- ✅ Approve events: `PUT /api/events/approve/:id`
- ✅ Reject events: `PUT /api/events/reject/:id`
- ✅ View rejected events: `GET /api/events/rejected`
- ✅ Move events back to pending: `PUT /api/events/disapprove/:id`
- ✅ Manage users and NGOs

## 🔒 Security Notes

1. **Strong Passwords**: Use passwords with:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number

2. **Limit Enforced**: Maximum 2 admins to prevent unauthorized access

3. **Token Expiration**: Admin tokens expire after 24 hours

4. **Rate Limiting**: 
   - Registration: 3 attempts per hour
   - Login: 5 attempts per 15 minutes

## 🆘 Troubleshooting

### "Admin registration limit reached"
- Maximum 2 admins allowed
- Delete an existing admin if you need to add a new one

### "Email already exists"
- Use a different email address
- Or login with existing credentials

### "Validation failed"
- Check password meets requirements (8+ chars, uppercase, lowercase, number)
- Verify email format is correct

## 📊 Admin Management

To check how many admins exist, you can query the database or check the logs when registering.

The system will log:
```
Admin registered: admin@example.com (1/2)
```

This shows you've registered 1 out of 2 allowed admins.

---

**Your first admin is already created!**
- Email: `admin@test.com`
- Password: `AdminPass123`

You can register **1 more admin** if needed.
