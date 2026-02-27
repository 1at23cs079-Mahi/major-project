-- Database Backup Script for PostgreSQL
-- Run this script daily via cron/Task Scheduler

-- Create backup directory if not exists
-- mkdir -p /var/backups/healthcare

-- Backup command (run from terminal):
-- pg_dump -U postgres -d healthcare_db > /var/backups/healthcare/backup_$(date +%Y%m%d_%H%M%S).sql

-- Automated backup script (Linux cron):
-- 0 2 * * * pg_dump -U postgres -d healthcare_db > /var/backups/healthcare/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql

-- Windows Task Scheduler command:
-- pg_dump -U postgres -d healthcare_db > C:\Backups\healthcare\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql

-- Backup verification query
SELECT 
    COUNT(*) as total_users,
    (SELECT COUNT(*) FROM patients) as total_patients,
    (SELECT COUNT(*) FROM doctors) as total_doctors,
    (SELECT COUNT(*) FROM prescriptions) as total_prescriptions,
    (SELECT COUNT(*) FROM appointments) as total_appointments,
    NOW() as backup_time;

-- Cleanup old backups (keep last 30 days)
-- find /var/backups/healthcare -type f -name "backup_*.sql" -mtime +30 -delete

-- Point-in-time recovery setup
-- Edit postgresql.conf:
-- wal_level = replica
-- archive_mode = on
-- archive_command = 'cp %p /var/backups/healthcare/wal/%f'

-- Restore from backup:
-- psql -U postgres -d healthcare_db < /var/backups/healthcare/backup_YYYYMMDD_HHMMSS.sql
