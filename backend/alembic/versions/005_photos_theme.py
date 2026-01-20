"""add profile_photo, dark_mode, device_photo

Revision ID: 005_photos_theme
Revises: 004_brand_model
Create Date: 2026-01-20 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '005_photos_theme'
down_revision: Union[str, None] = '004_brand_model'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add profile_photo and dark_mode to users table
    op.add_column('users', sa.Column('profile_photo', sa.String(length=1000), nullable=True))
    op.add_column('users', sa.Column('dark_mode', sa.Boolean(), nullable=False, server_default='false'))
    
    # Add photo to devices table
    op.add_column('devices', sa.Column('photo', sa.String(length=1000), nullable=True))


def downgrade() -> None:
    # Remove photo from devices table
    op.drop_column('devices', 'photo')
    
    # Remove profile_photo and dark_mode from users table
    op.drop_column('users', 'dark_mode')
    op.drop_column('users', 'profile_photo')
