import pytest
from rest_framework.test import APIClient

from establishments.models import Establishment, Location, Tag
from users.models import User


@pytest.fixture
def api_client():
    return APIClient()


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
def client_user(db):
    return User.objects.create_user(
        username="client",
        email="client@example.com",
        password="Password123!",
        role=User.Role.CLIENT,
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
def authenticated_owner(api_client, owner_user):
    api_client.force_authenticate(user=owner_user)
    return api_client


@pytest.fixture
def authenticated_client(api_client, client_user):
    api_client.force_authenticate(user=client_user)
    return api_client


@pytest.fixture
def authenticated_admin(api_client, admin_user):
    api_client.force_authenticate(user=admin_user)
    return api_client


@pytest.fixture
def tag(db):
    return Tag.objects.create(
        name="Mediterránea",
        description="Cocina mediterránea",
    )


@pytest.fixture
def establishment(db, owner_user, tag):
    establishment = Establishment.objects.create(
        owner=owner_user,
        name="La Encina Verde",
        description="Restaurante mediterráneo.",
        phone="911234567",
        email="contacto@example.com",
        opening_time="12:00:00",
        closing_time="23:30:00",
        cross_contamination="Superficies compartidas.",
        restrictions_info="Información disponible.",
        active=True,
    )

    establishment.tags.add(tag)

    Location.objects.create(
        establishment=establishment,
        address="Calle de la Encina, 12",
        city="Madrid",
        region="Madrid",
        country="España",
        postal_code="28103",
        latitude=40.4168,
        longitude=-3.7038,
    )

    return establishment
