import pytest
from django.contrib.auth import get_user_model
from rest_framework import status

from food_profiles.models import FoodProfile

User = get_user_model()


@pytest.mark.django_db
class TestUserRegistration:
    def test_register_client(self, api_client):
        """A public registration must create a client user."""
        data = {
            "username": "alex",
            "email": "alex@test.com",
            "password": "Password123!",
        }

        response = api_client.post(
            "/api/users/register/",
            data,
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        user = User.objects.get(username="alex")

        assert user.email == "alex@test.com"
        assert user.role == User.Role.CLIENT
        assert user.check_password("Password123!")

    def test_register_cannot_choose_admin_role(self, api_client):
        """A user must not gain administrator privileges during registration."""
        data = {
            "username": "hacker",
            "email": "hacker@test.com",
            "password": "Password123!",
            "role": User.Role.ADMIN,
        }

        response = api_client.post(
            "/api/users/register/",
            data,
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        user = User.objects.get(username="hacker")

        assert user.role == User.Role.CLIENT

    def test_register_cannot_choose_owner_role(self, api_client):
        """A user must not be able to register as an owner."""
        data = {
            "username": "fake_owner",
            "email": "fakeowner@test.com",
            "password": "Password123!",
            "role": User.Role.OWNER,
        }

        response = api_client.post(
            "/api/users/register/",
            data,
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        user = User.objects.get(username="fake_owner")

        assert user.role == User.Role.CLIENT

    def test_registration_creates_food_profile(
        self,
        api_client,
    ):
        """Registering a client must create an empty food profile."""

        response = api_client.post(
            "/api/users/register/",
            {
                "username": "newclient",
                "email": "newclient@example.com",
                "password": "Password123!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        user = User.objects.get(
            email="newclient@example.com",
        )

        assert FoodProfile.objects.filter(
            client=user,
        ).exists()
