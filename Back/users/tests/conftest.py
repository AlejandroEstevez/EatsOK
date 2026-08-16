import pytest

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


@pytest.fixture
def api_client():
    """Return a DRF API client."""
    return APIClient()


@pytest.fixture
def client_user(db):
    """Create a regular client user."""
    return User.objects.create_user(
        username="client",
        email="client@test.com",
        password="Password123!",
        role=User.Role.CLIENT,
    )


@pytest.fixture
def owner_user(db):
    """Create an owner user."""
    return User.objects.create_user(
        username="owner",
        email="owner@test.com",
        password="Password123!",
        role=User.Role.OWNER,
    )


@pytest.fixture
def admin_user(db):
    """Create an administrator user."""
    return User.objects.create_user(
        username="admin",
        email="admin@test.com",
        password="Password123!",
        role=User.Role.ADMIN,
    )


@pytest.fixture
def authenticated_client(api_client, client_user):
    """Return an API client authenticated as a regular client."""
    refresh = RefreshToken.for_user(client_user)

    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
    )

    return api_client


@pytest.fixture
def authenticated_admin(api_client, admin_user):
    """Return an API client authenticated as an administrator."""
    refresh = RefreshToken.for_user(admin_user)

    api_client.credentials(
        HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}"
    )

    return api_client
