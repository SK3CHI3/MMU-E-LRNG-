# Admin User Deletion System

## Overview

The MMU Learning Management System now includes comprehensive user deletion functionality for administrators. This system allows admins to safely and completely remove users from the system while maintaining data integrity and providing audit trails.

## Features

### 🗑️ **Complete User Deletion**
- Permanently removes users and all associated data
- Handles foreign key relationships automatically
- Provides detailed impact analysis before deletion
- Includes confirmation dialogs to prevent accidental deletions

### 🔄 **Soft Deletion (Deactivation)**
- Marks users as inactive without permanent deletion
- Prevents login while preserving data
- Allows reactivation if needed
- Safer alternative to permanent deletion

### 📦 **Bulk Operations**
- Delete or deactivate multiple users at once
- Select individual users or use "Select All"
- Progress tracking and detailed results
- Batch processing with error handling

### 🛡️ **Safety Features**
- Self-protection: Admins cannot delete their own accounts
- Confirmation dialogs with impact preview
- Type-to-confirm for permanent deletions
- Detailed logging of all admin actions

## How to Use

### Accessing User Management

1. Log in as an admin user
2. Navigate to **Admin Dashboard**
3. Click on **User Management** in the sidebar
4. You'll see the comprehensive user management interface

### Individual User Actions

#### Delete a User Permanently
1. Find the user in the list
2. Click the red **trash icon** (🗑️) in the actions column
3. Review the deletion impact dialog showing:
   - User information
   - Related data that will be deleted
   - Courses, assignments, submissions affected
4. Type **"DELETE"** in the confirmation field
5. Click **"Delete User"** to confirm

#### Deactivate a User
1. Find the user in the list
2. Click the orange **user-X icon** (👤❌) for active users
3. User will be immediately deactivated
4. They will no longer be able to log in

#### Reactivate a User
1. Find the deactivated user in the list
2. Click the green **user-check icon** (👤✅) for inactive users
3. User will be immediately reactivated
4. They can now log in again

### Bulk Operations

#### Select Multiple Users
1. Use the checkboxes next to each user
2. Or click **"Select All"** in the header to select all visible users
3. Note: You cannot select your own account

#### Bulk Delete
1. Select the users you want to delete
2. Click **"Delete (X)"** button in the header
3. Confirm the bulk deletion
4. View results summary

#### Bulk Deactivate
1. Select the users you want to deactivate
2. Click **"Deactivate (X)"** button in the header
3. Confirm the bulk deactivation
4. View results summary

## Data Impact

When a user is deleted, the following data is affected:

### Completely Removed
- User profile and account information
- Course enrollments
- Assignment submissions
- Exam attempts and answers
- Class attendance records
- Personal notifications
- Fee and payment records
- Personal messages
- Analytics data

### Orphaned (Creator References Set to NULL)
- Courses created by the user
- Assignments created by the user
- Course materials uploaded by the user
- Class sessions created by the user
- System settings modified by the user

## Security & Permissions

### Who Can Delete Users
- Only users with **admin** role can access deletion functions
- Admins cannot delete their own accounts
- All deletion actions are logged for audit purposes

### Audit Trail
Every deletion action is logged with:
- Admin who performed the action
- Target user information
- Timestamp of the action
- Type of action (delete, deactivate, reactivate)
- Additional context and results

## Technical Implementation

### Backend Functions
- `deleteUserCompletely()` - Permanent deletion with cleanup
- `deactivateUser()` / `reactivateUser()` - Soft deletion
- `bulkDeleteUsers()` / `bulkDeactivateUsers()` - Batch operations
- `getUserDeletionInfo()` - Impact analysis
- `logAdminAction()` - Audit logging

### Database Cleanup
The system automatically handles cleanup of related tables:
- `course_enrollments`
- `assignment_submissions`
- `exam_attempts`
- `class_attendance`
- `notifications`
- `student_fees`
- `payment_history`
- `analytics_data`
- And more...

## Testing

### Manual Testing
1. Create test users with different roles
2. Test individual deletion, deactivation, and reactivation
3. Test bulk operations
4. Verify data cleanup in database
5. Check audit logs

### Automated Testing
Use the test utilities in `src/utils/testUserDeletion.ts`:

```javascript
// In browser console
window.testUserDeletion.runDeletionTests();
```

## Best Practices

### Before Deleting Users
1. **Export user data** if needed for records
2. **Review impact analysis** carefully
3. **Consider deactivation** instead of permanent deletion
4. **Notify relevant stakeholders** about the deletion

### When to Use Each Option
- **Permanent Deletion**: For spam accounts, test users, or when required by data protection laws
- **Deactivation**: For temporary suspensions, graduated students, or former staff
- **Bulk Operations**: For cleaning up multiple test accounts or mass deactivations

### Security Considerations
- Only delete users when absolutely necessary
- Always review the impact analysis
- Keep audit logs for compliance
- Consider data retention policies
- Backup important data before mass deletions

## Troubleshooting

### Common Issues
1. **Cannot delete user**: Check if you're trying to delete your own account
2. **Deletion fails**: Check database constraints and foreign key relationships
3. **Bulk operation errors**: Review individual error messages in results
4. **Missing permissions**: Ensure you have admin role

### Error Messages
- "Cannot Delete: You cannot delete your own account"
- "User not found"
- "Failed to delete user completely"
- "Deactivation failed"

## Support

For technical issues or questions about the user deletion system:
1. Check the browser console for detailed error messages
2. Review the audit logs in the analytics section
3. Contact the system administrator
4. Refer to the database schema documentation

---

**⚠️ Warning**: User deletion is irreversible. Always double-check before confirming permanent deletions.
