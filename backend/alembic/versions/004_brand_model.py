"""add brand and model to devices

Revision ID: 004_brand_model
Revises: 003_scanned_by_access
Create Date: 2026-01-20 16:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '004_brand_model'
down_revision: Union[str, None] = '003_scanned_by_access'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add brand and model columns to devices table
    op.add_column('devices', sa.Column('brand', sa.String(length=100), nullable=True))
    op.add_column('devices', sa.Column('model', sa.String(length=100), nullable=True))


def downgrade() -> None:
    # Remove brand and model columns from devices table
    op.drop_column('devices', 'model')
    op.drop_column('devices', 'brand')
