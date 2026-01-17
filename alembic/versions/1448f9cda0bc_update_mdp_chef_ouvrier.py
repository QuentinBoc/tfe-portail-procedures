"""Update mdp chef_ouvrier

Revision ID: 1448f9cda0bc
Revises: 6796ba4e0849
Create Date: 2025-12-25 10:09:41.055097

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1448f9cda0bc'
down_revision: Union[str, Sequence[str], None] = '6796ba4e0849'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
