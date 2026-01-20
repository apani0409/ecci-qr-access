"""increase photo fields size

Revision ID: 006_increase_photo_fields
Revises: 005_photos_theme
Create Date: 2026-01-20

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '006_increase_photo_fields'
down_revision = '005_photos_theme'
branch_labels = None
depends_on = None


def upgrade():
    # Change String(1000) to Text for profile_photo and device photo
    op.alter_column('users', 'profile_photo',
                    existing_type=sa.String(length=1000),
                    type_=sa.Text(),
                    existing_nullable=True)
    
    op.alter_column('devices', 'photo',
                    existing_type=sa.String(length=1000),
                    type_=sa.Text(),
                    existing_nullable=True)


def downgrade():
    op.alter_column('users', 'profile_photo',
                    existing_type=sa.Text(),
                    type_=sa.String(length=1000),
                    existing_nullable=True)
    
    op.alter_column('devices', 'photo',
                    existing_type=sa.Text(),
                    type_=sa.String(length=1000),
                    existing_nullable=True)
