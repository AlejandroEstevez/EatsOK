import pytest
from rest_framework.test import APIClient

from food_profiles.models import FoodProfile
from users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def client_user(db):
    user = User.objects.create_user(
        username="client",
        email="client@example.com",
        password="Password123!",
        role=User.Role.CLIENT,
    )

    FoodProfile.objects.create(client=user)

    return user


@pytest.fixture
def authenticated_client(api_client, client_user):
    api_client.force_authenticate(user=client_user)

    return api_client
