import pytest
from rest_framework.test import APIClient

from establishments.models import Establishment, Location
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
def other_owner(db):
    return User.objects.create_user(
        username="other_owner",
        email="other_owner@example.com",
        password="Password123!",
        role=User.Role.OWNER,
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
def owner_establishment(db, owner_user):
    establishment = Establishment.objects.create(
        owner=owner_user,
        name="La Encina Verde",
        description="Restaurante mediterráneo.",
        phone="911234567",
        email="contacto@example.com",
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
def other_owner_establishment(db, other_owner):
    establishment = Establishment.objects.create(
        owner=other_owner,
        name="Otro restaurante",
        description="Restaurante de otro propietario.",
        active=True,
    )

    Location.objects.create(
        establishment=establishment,
        address="Calle Mayor, 1",
        city="Madrid",
        region="Madrid",
        country="España",
        postal_code="28001",
    )

    return establishment
