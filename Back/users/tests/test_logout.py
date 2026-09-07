import pytest
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
class TestLogout:
    def test_logout_blacklists_refresh_token(
        self,
        api_client,
        client_user,
    ):
        """Logging out must prevent the refresh token from being reused."""
        refresh = RefreshToken.for_user(client_user)

        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

        response = api_client.post(
            "/api/users/logout/",
            {
                "refresh": str(refresh),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT

        api_client.credentials()

        refresh_response = api_client.post(
            "/api/users/token/refresh/",
            {
                "refresh": str(refresh),
            },
            format="json",
        )

        assert refresh_response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_logout_requires_authentication(
        self,
        api_client,
        client_user,
    ):
        """Unauthenticated requests must not use the logout endpoint."""
        refresh = RefreshToken.for_user(client_user)

        response = api_client.post(
            "/api/users/logout/",
            {
                "refresh": str(refresh),
            },
            format="json",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
