import pytest

from django.contrib.auth import get_user_model
from rest_framework import status


User = get_user_model()


@pytest.mark.django_db
class TestOwnerRegistration:

    def test_client_cannot_create_owner(
        self,
        authenticated_client,
    ):
        """Regular clients must not be able to create owner accounts."""
        response = authenticated_client.post(
            "/api/users/owners/",
            {
                "username": "new_owner",
                "email": "owner@test.com",
                "password": "Password123!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

        assert not User.objects.filter(
            username="new_owner"
        ).exists()


    def test_admin_can_create_owner(
        self,
        authenticated_admin,
    ):
        """Administrators must be able to create owner accounts."""
        response = authenticated_admin.post(
            "/api/users/owners/",
            {
                "username": "new_owner",
                "email": "owner@test.com",
                "password": "Password123!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        user = User.objects.get(username="new_owner")

        assert user.role == User.Role.OWNER
        assert user.check_password("Password123!")


    def test_admin_cannot_choose_role_when_creating_owner(
        self,
        authenticated_admin,
    ):
        """The owner creation endpoint must always create an owner."""
        response = authenticated_admin.post(
            "/api/users/owners/",
            {
                "username": "new_owner",
                "email": "owner@test.com",
                "password": "Password123!",
                "role": User.Role.ADMIN,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        user = User.objects.get(username="new_owner")

        assert user.role == User.Role.OWNER
