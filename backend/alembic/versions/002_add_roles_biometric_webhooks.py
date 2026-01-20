"""Add roles, biometric auth, and webhooks

Revision ID: 002_add_roles_biometric_webhooks
Revises: 001_initial
Create Date: 2024-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision = '002_add_roles_biometric_webhooks'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add role column to users table
    op.add_column('users', sa.Column('role', sa.String(20), nullable=False, server_default='student'))
    
    # Add biometric authentication columns
    op.add_column('users', sa.Column('biometric_enabled', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('users', sa.Column('biometric_public_key', sa.Text(), nullable=True))
    
    # Create webhooks table
    op.create_table(
        'webhooks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('events', postgresql.ARRAY(sa.String(50)), nullable=False),
        sa.Column('secret', sa.String(100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_by_id', UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['created_by_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_webhooks_created_by_id', 'webhooks', ['created_by_id'])
    
    # Create webhook_logs table
    op.create_table(
        'webhook_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('webhook_id', sa.Integer(), nullable=False),
        sa.Column('event', sa.String(50), nullable=False),
        sa.Column('payload', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('response_status', sa.Integer(), nullable=True),
        sa.Column('response_body', sa.Text(), nullable=True),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['webhook_id'], ['webhooks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_webhook_logs_webhook_id', 'webhook_logs', ['webhook_id'])
    op.create_index('ix_webhook_logs_event', 'webhook_logs', ['event'])
    op.create_index('ix_webhook_logs_created_at', 'webhook_logs', ['created_at'])


def downgrade() -> None:
    # Drop webhook tables
    op.drop_index('ix_webhook_logs_created_at', table_name='webhook_logs')
    op.drop_index('ix_webhook_logs_event', table_name='webhook_logs')
    op.drop_index('ix_webhook_logs_webhook_id', table_name='webhook_logs')
    op.drop_table('webhook_logs')
    
    op.drop_index('ix_webhooks_created_by_id', table_name='webhooks')
    op.drop_table('webhooks')
    
    # Remove biometric columns
    op.drop_column('users', 'biometric_public_key')
    op.drop_column('users', 'biometric_enabled')
    
    # Remove role column
    op.drop_column('users', 'role')
