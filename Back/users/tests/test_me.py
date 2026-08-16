import pytest

from django.contrib.auth import get_user_model
from rest_framework import status


User = get_user_model()


@pytest.mark.django_db
class TestCurrentUser:

    def test_me_requires_authentication(self, api_client):
        """Unauthenticated users must not access their account."""
        response = api_client.get("/api/users/me/")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


    def test_authenticated_user_can_get_own_data(
        self,
        authenticated_client,
        client_user,
    ):
        """An authenticated user must retrieve their own account."""
        response = authenticated_client.get(
            "/api/users/me/"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["id"] == client_user.id
        assert response.data["username"] == client_user.username
        assert response.data["email"] == client_user.email
        assert response.data["role"] == User.Role.CLIENT


    def test_user_can_update_own_email(
        self,
        authenticated_client,
        client_user,
    ):
        """An authenticated user must update their own account data."""
        response = authenticated_client.patch(
            "/api/users/me/",
            {
                "email": "updated@test.com",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        client_user.refresh_from_db()

        assert client_user.email == "updated@test.com"


    def test_user_cannot_change_own_role(
        self,
        authenticated_client,
        client_user,
    ):
        """The user role must not be editable through the account endpoint."""
        response = authenticated_client.patch(
            "/api/users/me/",
            {
                "role": User.Role.ADMIN,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        client_user.refresh_from_db()

        assert client_user.role == User.Role.CLIENT
