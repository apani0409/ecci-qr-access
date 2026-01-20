#!/bin/sh
# PostgreSQL Backup Script
# Runs daily at 2 AM via cron

set -e

# Configuration
BACKUP_DIR="/backups"
DB_HOST="db"
DB_PORT="5432"
DB_NAME="${POSTGRES_DB}"
DB_USER="${POSTGRES_USER}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_${DB_NAME}_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting backup of database: ${DB_NAME}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Perform backup
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --format=plain \
    --no-owner \
    --no-acl \
    | gzip > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup completed successfully: ${BACKUP_FILE}"
    
    # Calculate backup size
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
    echo "[$(date)] Backup size: ${BACKUP_SIZE}"
    
    # Delete old backups
    echo "[$(date)] Cleaning up backups older than ${RETENTION_DAYS} days"
    find "${BACKUP_DIR}" -name "backup_${DB_NAME}_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
    
    # Count remaining backups
    BACKUP_COUNT=$(find "${BACKUP_DIR}" -name "backup_${DB_NAME}_*.sql.gz" -type f | wc -l)
    echo "[$(date)] Total backups retained: ${BACKUP_COUNT}"
    
else
    echo "[$(date)] ERROR: Backup failed!"
    exit 1
fi

echo "[$(date)] Backup process completed"
