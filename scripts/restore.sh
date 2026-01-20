#!/bin/bash
# Restore PostgreSQL database from backup
# Usage: ./restore.sh <backup_file>

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file>"
    echo "Example: $0 /backups/backup_ecci_control_20260120_020000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "Error: Backup file not found: ${BACKUP_FILE}"
    exit 1
fi

# Configuration from environment or defaults
DB_CONTAINER="${DB_CONTAINER:-ecci-db-prod}"
DB_NAME="${DB_NAME:-ecci_control}"
DB_USER="${DB_USER:-ecci_user}"

echo "[$(date)] Starting database restore from: ${BACKUP_FILE}"
echo "WARNING: This will overwrite the current database!"
read -p "Continue? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

# Stop dependent services
echo "[$(date)] Stopping backend service..."
docker compose -f docker-compose.prod.yml stop backend

# Restore database
echo "[$(date)] Restoring database..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${DB_CONTAINER}" psql -U "${DB_USER}" -d "${DB_NAME}"

if [ $? -eq 0 ]; then
    echo "[$(date)] Database restored successfully"
    
    # Restart services
    echo "[$(date)] Restarting services..."
    docker compose -f docker-compose.prod.yml start backend
    
    echo "[$(date)] Restore completed successfully"
else
    echo "[$(date)] ERROR: Restore failed!"
    docker compose -f docker-compose.prod.yml start backend
    exit 1
fi
