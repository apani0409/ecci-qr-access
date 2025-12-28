"""Create initial tables.

Revision ID: 001_initial
Revises:
Create Date: 2024-01-15 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('student_id', sa.String(20), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_student_id', 'users', ['student_id'], unique=True)

    # Create devices table
    op.create_table(
        'devices',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('device_type', sa.String(50), nullable=False),
        sa.Column('serial_number', sa.String(255), nullable=False),
        sa.Column('qr_code', sa.String(1000), nullable=True),
        sa.Column('qr_data', sa.String(500), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_devices_user_id', 'devices', ['user_id'])
    op.create_index('ix_devices_serial_number', 'devices', ['serial_number'], unique=True)
    op.create_index('ix_devices_qr_data', 'devices', ['qr_data'], unique=True)

    # Create access_records table
    op.create_table(
        'access_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('device_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('access_type', sa.Enum('entrada', 'salida', name='accesstype'), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('location', sa.String(255), nullable=True),
        sa.ForeignKeyConstraint(['device_id'], ['devices.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_access_records_device_id', 'access_records', ['device_id'])
    op.create_index('ix_access_records_user_id', 'access_records', ['user_id'])
    op.create_index('ix_access_records_timestamp', 'access_records', ['timestamp'])


def downgrade() -> None:
    op.drop_index('ix_access_records_timestamp', table_name='access_records')
    op.drop_index('ix_access_records_user_id', table_name='access_records')
    op.drop_index('ix_access_records_device_id', table_name='access_records')
    op.drop_table('access_records')

    op.drop_index('ix_devices_qr_data', table_name='devices')
    op.drop_index('ix_devices_serial_number', table_name='devices')
    op.drop_index('ix_devices_user_id', table_name='devices')
    op.drop_table('devices')

    op.drop_index('ix_users_student_id', table_name='users')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
