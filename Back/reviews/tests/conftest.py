import pytest

from rest_framework.test import APIClient

from establishments.models import Establishment, Location
from recipes.models import Recipe
from users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def client_user(db):
    return User.objects.create_user(
        username="client",
        email="client@example.com",
        password="Password123!",
        role=User.Role.CLIENT,
    )


@pytest.fixture
def other_client(db):
    return User.objects.create_user(
        username="other_client",
        email="other_client@example.com",
        password="Password123!",
        role=User.Role.CLIENT,
    )


@pytest.fixture
def owner_user(db):
    return User.objects.create_user(
        username="owner",
        email="owner@example.com",
        password="Password123!",
        role=User.Role.OWNER,
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username="admin",
        email="admin@example.com",
        password="Password123!",
        role=User.Role.ADMIN,
    )


@pytest.fixture
def authenticated_client(api_client, client_user):
    api_client.force_authenticate(user=client_user)
    return api_client


@pytest.fixture
def authenticated_owner(api_client, owner_user):
    api_client.force_authenticate(user=owner_user)
    return api_client


@pytest.fixture
def authenticated_admin(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def establishment(db, owner_user):
    establishment = Establishment.objects.create(
        owner=owner_user,
        name="La Encina Verde",
        description="Restaurante mediterráneo.",
        active=True,
    )

    Location.objects.create(
        establishment=establishment,
        address="Calle de la Encina, 12",
        city="Madrid",
        region="Madrid",
        country="España",
        postal_code="28103",
    )

    return establishment


@pytest.fixture
def recipe(db, client_user):
    return Recipe.objects.create(
        author=client_user,
        title="Tortitas sin gluten",
        description="Receta adaptada.",
        ingredients="Harina sin gluten\nHuevos",
        steps="Mezclar y cocinar.",
        visible=True,
    )
