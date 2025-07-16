# RUNACOSS Admin System

A comprehensive role-based admin system for managing RUNACOSS content, users, and system operations with granular permissions and activity logging.

## Features

### 🔐 Role-Based Access Control
- **Super Admin**: Full system access
- **Admin**: Full content management access
- **Moderator**: Limited content management access

### 📊 Content Management
- **Repository**: Upload, edit, delete, approve files
- **Blogs**: Create, edit, delete, publish blogs
- **News**: Create, edit, delete, schedule news
- **Users**: Manage user accounts and permissions

### 📈 Analytics & Monitoring
- Dashboard statistics
- Activity logging
- User analytics
- File usage tracking

## Admin Roles & Permissions

### Super Admin
- Full system access
- Manage other admins
- System settings and logs
- Data backup and restore

### Admin
- Full content management
- User management
- Repository management
- Blog and news management

### Moderator
- Limited content management
- File approval
- Basic user management
- Content moderation

## Permission Matrix

| Module | Action | Super Admin | Admin | Moderator |
|--------|--------|-------------|-------|-----------|
| **Repository** | View | ✅ | ✅ | ✅ |
| | Upload | ✅ | ✅ | ✅ |
| | Edit | ✅ | ✅ | ❌ |
| | Delete | ✅ | ✅ | ❌ |
| | Approve | ✅ | ✅ | ✅ |
| | Manage Categories | ✅ | ✅ | ❌ |
| | View Stats | ✅ | ✅ | ❌ |
| **Blogs** | View | ✅ | ✅ | ✅ |
| | Create | ✅ | ✅ | ❌ |
| | Edit | ✅ | ✅ | ❌ |
| | Delete | ✅ | ✅ | ❌ |
| | Approve | ✅ | ✅ | ✅ |
| | Publish | ✅ | ✅ | ❌ |
| | Manage Comments | ✅ | ✅ | ✅ |
| **News** | View | ✅ | ✅ | ✅ |
| | Create | ✅ | ✅ | ❌ |
| | Edit | ✅ | ✅ | ❌ |
| | Delete | ✅ | ✅ | ❌ |
| | Approve | ✅ | ✅ | ✅ |
| | Publish | ✅ | ✅ | ❌ |
| | Schedule | ✅ | ✅ | ❌ |
| **Users** | View | ✅ | ✅ | ❌ |
| | Create | ✅ | ✅ | ❌ |
| | Edit | ✅ | ✅ | ❌ |
| | Delete | ✅ | ✅ | ❌ |
| | Suspend | ✅ | ✅ | ❌ |
| | Manage Roles | ✅ | ✅ | ❌ |
| | View Stats | ✅ | ✅ | ❌ |
| **System** | View Logs | ✅ | ❌ | ❌ |
| | Manage Settings | ✅ | ❌ | ❌ |
| | Backup Data | ✅ | ❌ | ❌ |
| | Restore Data | ✅ | ❌ | ❌ |
| | Manage Admins | ✅ | ❌ | ❌ |

## User Restrictions

### Regular Users
- **Repository**: View, upload, download, delete own files
- **Blogs**: View only
- **News**: View only
- **Users**: View own profile only

### Admin Users
- **Repository**: Full access to all files
- **Blogs**: Full CRUD access
- **News**: Full CRUD access
- **Users**: Full management access

## API Endpoints

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/register` - Create new admin (Super Admin only)
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile

### Repository Management
- `GET /api/admin/repository/files` - Get all repository files
- `PUT /api/admin/repository/files/:fileId/approve` - Approve file
- `DELETE /api/admin/repository/files/:fileId` - Delete file

### Blog Management
- `GET /api/admin/blogs` - Get all blogs
- `POST /api/admin/blogs` - Create blog
- `PUT /api/admin/blogs/:blogId` - Update blog
- `DELETE /api/admin/blogs/:blogId` - Delete blog

### News Management
- `GET /api/admin/news` - Get all news
- `POST /api/admin/news` - Create news
- `PUT /api/admin/news/:newsId` - Update news
- `DELETE /api/admin/news/:newsId` - Delete news

### User Management
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Delete user

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

## Database Schema

### Admin Model
```javascript
const adminSchema = new mongoose.Schema({
  // Basic info
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  
  // Role and permissions
  role: {
    type: String,
    enum: ['super-admin', 'admin', 'moderator'],
    default: 'admin'
  },
  
  permissions: {
    repository: {
      view: Boolean,
      upload: Boolean,
      edit: Boolean,
      delete: Boolean,
      approve: Boolean,
      manageCategories: Boolean,
      viewStats: Boolean
    },
    blogs: {
      view: Boolean,
      create: Boolean,
      edit: Boolean,
      delete: Boolean,
      approve: Boolean,
      publish: Boolean,
      manageComments: Boolean
    },
    news: {
      view: Boolean,
      create: Boolean,
      edit: Boolean,
      delete: Boolean,
      approve: Boolean,
      publish: Boolean,
      schedule: Boolean
    },
    users: {
      view: Boolean,
      create: Boolean,
      edit: Boolean,
      delete: Boolean,
      suspend: Boolean,
      manageRoles: Boolean,
      viewStats: Boolean
    },
    system: {
      viewLogs: Boolean,
      manageSettings: Boolean,
      backupData: Boolean,
      restoreData: Boolean,
      manageAdmins: Boolean
    }
  },
  
  // Status and security
  isActive: Boolean,
  isVerified: Boolean,
  lastLogin: Date,
  loginAttempts: Number,
  lockUntil: Date,
  
  // Activity tracking
  activityLog: [{
    action: String,
    target: String,
    targetId: ObjectId,
    details: String,
    ipAddress: String,
    userAgent: String,
    timestamp: Date
  }]
});
```

## Middleware

### requireAdminSignIn
- Verifies admin JWT token
- Checks admin account status
- Adds admin info to request

### checkAdminPermission
- Validates admin permissions
- Checks module and action access
- Returns 403 for insufficient permissions

### requireUserSignIn
- Verifies user JWT token
- Restricts user access to basic operations
- Adds user info to request

## Frontend Components

### AdminDashboard
- Overview statistics
- Recent activity
- Quick actions
- Navigation tabs

### Admin API Services
- Authentication services
- Content management APIs
- User management APIs
- Dashboard APIs

## Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Account lockout protection
- Email verification

### Authorization
- Role-based access control
- Granular permissions
- Module-level restrictions
- Action-level validation

### Activity Logging
- Comprehensive activity tracking
- IP address logging
- User agent tracking
- Timestamp recording

### Rate Limiting
- API rate limiting
- Login attempt limiting
- Upload rate limiting
- Request throttling

## Usage Examples

### Admin Login
```typescript
const loginData = {
  email: 'admin@runacoss.com',
  password: 'securepassword'
};

const response = await adminApi.auth.login(loginData.email, loginData.password);
const { admin, token } = response.data;
```

### Create Blog
```typescript
const blogData = {
  title: 'New Blog Post',
  content: 'Blog content here...',
  status: 'published'
};

const blog = await adminApi.blogs.createBlog(blogData);
```

### Approve File
```typescript
await adminApi.repository.approveFile(fileId);
```

### Get Dashboard Stats
```typescript
const stats = await adminApi.dashboard.getDashboardStats();
console.log(stats.data.counts);
```

### Update User
```typescript
const updateData = {
  role: 'admin',
  isVerified: true,
  isActive: true
};

await adminApi.users.updateUser(userId, updateData);
```

## Environment Variables

### Server (.env)
```env
JWT_SECRET=your-jwt-secret
ADMIN_EMAIL=admin@runacoss.com
ADMIN_PASSWORD=securepassword
ADMIN_ROLE=super-admin
```

## Installation & Setup

1. **Create Admin Model**
   ```bash
   # The admin model is already created in server/src/models/adminModel.js
   ```

2. **Set up Admin Routes**
   ```bash
   # Admin routes are configured in server/src/routes/adminRoutes.js
   ```

3. **Configure Middleware**
   ```bash
   # Middleware files are in server/src/middleware/
   ```

4. **Create Super Admin**
   ```javascript
   // Create super admin in database initialization
   const superAdmin = new Admin({
     firstName: 'Super',
     lastName: 'Admin',
     email: 'admin@runacoss.com',
     password: 'securepassword',
     role: 'super-admin',
     isVerified: true,
     isActive: true
   });
   ```

5. **Update App Configuration**
   ```javascript
   // Add admin routes to app.js
   app.use("/admin", authLimiter, adminRouter);
   ```

## Best Practices

### Security
- Use strong passwords
- Enable two-factor authentication
- Regular security audits
- Monitor activity logs

### Permissions
- Follow principle of least privilege
- Regular permission reviews
- Audit trail maintenance
- Role-based access control

### Monitoring
- Track admin activities
- Monitor system performance
- Log security events
- Regular backups

## Troubleshooting

### Common Issues

1. **Permission Denied**
   - Check admin role and permissions
   - Verify module and action access
   - Review middleware configuration

2. **Authentication Failed**
   - Verify JWT token
   - Check account status
   - Validate email verification

3. **Activity Logging Issues**
   - Check database connection
   - Verify log storage
   - Review log retention

### Debug Mode
```javascript
// Enable debug logging
process.env.DEBUG = 'admin:*';
```

## Contributing

1. Follow security guidelines
2. Test permission changes
3. Update documentation
4. Review activity logs

## License

This admin system is part of the RUNACOSS project and follows the same licensing terms. 