import pytest

from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
class TestLogin:

    def test_login_with_valid_credentials(
        self,
        api_client,
        client_user,
    ):
        """Valid credentials must return access and refresh tokens."""
        response = api_client.post(
            "/api/users/login/",
            {
                "email": client_user.email,
                "password": "Password123!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data

    def test_login_with_invalid_password(
        self,
        api_client,
        client_user,
    ):
        """Invalid credentials must not generate authentication tokens."""
        response = api_client.post(
            "/api/users/login/",
            {
                "email": client_user.email,
                "password": "WrongPassword123!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert "access" not in response.data
        assert "refresh" not in response.data

    def test_refresh_token(
        self,
        api_client,
        client_user,
    ):
        """A valid refresh token must generate a new access token."""
        refresh = RefreshToken.for_user(client_user)

        response = api_client.post(
            "/api/users/token/refresh/",
            {
                "refresh": str(refresh),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
