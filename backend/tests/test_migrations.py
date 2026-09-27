import importlib.util
import uuid
from pathlib import Path

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


def load_initial_migration():
    path = Path(__file__).parents[1] / "alembic" / "versions" / "20260922_0001_initial.py"
    spec = importlib.util.spec_from_file_location("selo_vivo_initial_migration", path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_issuer_seed_uses_native_uuid_parameter():
    statement = load_initial_migration().issuer_seed_statement()
    identifier = statement._bindparams["id"]

    assert isinstance(identifier.value, uuid.UUID)
    assert isinstance(identifier.type, sa.Uuid)
    assert "::UUID" in str(statement.compile(dialect=postgresql.dialect()))
