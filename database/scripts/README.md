# 📁 Database Scripts

This folder contains utility scripts for database maintenance, fixes, and specific operations.

## 📋 Script Categories

### 🔧 Maintenance Scripts
- **check_announcement_triggers.sql** - Verify announcement trigger functionality
- **check_messages_schema.sql** - Validate messaging schema integrity
- **cleanup_notification_orphans.sql** - Remove orphaned notification records

### 🚀 Deployment Scripts
- **deploy_sample_data.sql** - Deploy sample data for testing
- **deploy_student_portal.sql** - Student portal specific deployment
- **populate_mmu_programmes.sql** - Populate MMU academic programmes

### 🔄 Migration Scripts
- **migrate_backend_compatibility.sql** - Backend compatibility updates
- **exam_system_update.sql** - Exam system schema updates
- **student_portal_update.sql** - Student portal schema updates

### 🛠️ Fix Scripts
- **fix_announcement_creation.sql** - Fix announcement creation issues
- **fix_messaging_columns.sql** - Fix messaging table columns

### 📊 Sample Data Scripts
- **sample_courses_data.sql** - Sample course data for testing

## 🚨 Usage Warning

These scripts should be used with caution in production environments. Always:

1. **Backup your database** before running any script
2. **Test in development** environment first
3. **Review the script** contents before execution
4. **Monitor execution** for any errors

## 📝 Script Execution Order

For fresh deployments, run scripts in this order:

1. Main schema (`../schema.sql`)
2. Storage setup (`../storage_setup.sql`)
3. Sample data (`../sample_data.sql`)
4. Specific scripts as needed

## 🔗 Related Documentation

- [Database Schema](../../docs/DATABASE_SCHEMA.md)
- [Deployment Guide](../../docs/DEPLOYMENT.md)
- [Architecture Overview](../../docs/ARCHITECTURE.md)
