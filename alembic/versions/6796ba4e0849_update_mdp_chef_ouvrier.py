"""Update mdp chef_ouvrier

Revision ID: 6796ba4e0849
Revises: 7122226b3566
Create Date: 2025-12-25 10:08:47.234790

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6796ba4e0849'
down_revision: Union[str, Sequence[str], None] = '7122226b3566'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
