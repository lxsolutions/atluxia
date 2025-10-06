"""Basic tests for EverPath API."""

import pytest


def test_api_imports():
    """Test that the API can be imported without errors."""
    from app.main import app
    assert app is not None
    assert app.title == "EverPath API"


def test_routers_registered():
    """Test that all routers are properly registered."""
    from app.main import app
    
    # Check that routers are in the app
    router_paths = [route.path for route in app.routes]
    
    # Check for key endpoints
    assert "/" in router_paths
    assert "/health" in router_paths
    assert any("/auth" in path for path in router_paths)
    assert any("/catalog" in path for path in router_paths)
    assert any("/path" in path for path in router_paths)


def test_models_exist():
    """Test that all models can be imported."""
    from app.models.user import User, UserCreate, UserRead
    from app.models.profile import Profile
    from app.models.skill import Skill
    from app.models.role import Role
    from app.models.quest import Quest
    from app.models.assessment import Assessment
    from app.models.lesson import Lesson
    from app.models.artifact import Artifact
    from app.models.job_lead import JobLead
    from app.models.recommendation import Recommendation
    from app.models.xp_ledger import XPLedger
    
    # Just verify imports work
    assert User is not None
    assert Profile is not None
    assert Skill is not None


def test_security_functions():
    """Test that security functions can be imported."""
    from app.core.security import (
        verify_password,
        get_password_hash,
        create_access_token,
        verify_token,
        get_current_user
    )
    
    # Just verify imports work
    assert verify_password is not None
    assert get_password_hash is not None


def test_config():
    """Test that configuration can be loaded."""
    from app.core.config import settings
    
    assert settings is not None
    assert hasattr(settings, 'DATABASE_URL')
    assert hasattr(settings, 'JWT_SECRET')