import pytest

from rest_framework import status


@pytest.mark.django_db
class TestChangePassword:

    def test_change_password(
        self,
        authenticated_client,
        client_user,
    ):
        """An authenticated user must be able to change their password."""
        response = authenticated_client.post(
            "/api/users/change-password/",
            {
                "old_password": "Password123!",
                "new_password": "NewPassword456!",
                "new_password_confirm": "NewPassword456!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        client_user.refresh_from_db()

        assert client_user.check_password("NewPassword456!")
        assert not client_user.check_password("Password123!")


    def test_change_password_with_wrong_current_password(
        self,
        authenticated_client,
        client_user,
    ):
        """The current password must be verified before changing it."""
        response = authenticated_client.post(
            "/api/users/change-password/",
            {
                "old_password": "WrongPassword123!",
                "new_password": "NewPassword456!",
                "new_password_confirm": "NewPassword456!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

        client_user.refresh_from_db()

        assert client_user.check_password("Password123!")


    def test_change_password_requires_matching_confirmation(
        self,
        authenticated_client,
        client_user,
    ):
        """The password confirmation must match the new password."""
        response = authenticated_client.post(
            "/api/users/change-password/",
            {
                "old_password": "Password123!",
                "new_password": "NewPassword456!",
                "new_password_confirm": "DifferentPassword456!",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

        client_user.refresh_from_db()

        assert client_user.check_password("Password123!")
