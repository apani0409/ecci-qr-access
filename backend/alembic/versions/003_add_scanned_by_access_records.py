"""Add scanned_by_id to access_records

Revision ID: 003_scanned_by_access
Revises: 002_add_roles_biometric_webhooks
Create Date: 2026-01-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql, postgresql as pg

# revision identifiers, used by Alembic.
revision = '003_scanned_by_access'
down_revision = '002_add_roles_biometric_webhooks'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'access_records',
        sa.Column('scanned_by_id', pg.UUID(as_uuid=True), nullable=True)
    )
    op.create_index(
        'ix_access_records_scanned_by_id',
        'access_records',
        ['scanned_by_id']
    )
    op.create_foreign_key(
        'fk_access_records_scanned_by_id_users',
        source_table='access_records',
        referent_table='users',
        local_cols=['scanned_by_id'],
        remote_cols=['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    op.drop_constraint('fk_access_records_scanned_by_id_users', 'access_records', type_='foreignkey')
    op.drop_index('ix_access_records_scanned_by_id', table_name='access_records')
    op.drop_column('access_records', 'scanned_by_id')
