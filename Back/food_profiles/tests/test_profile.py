import pytest
from rest_framework import status

from food_profiles.models import Restriction


@pytest.mark.django_db
class TestFoodProfile:
    def test_food_profile_requires_authentication(
        self,
        api_client,
    ):
        """Unauthenticated users must not access food profiles."""
        response = api_client.get(
            "/api/food-profiles/",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_own_food_profile(
        self,
        authenticated_client,
        client_user,
    ):
        """A client must be able to retrieve their own food profile."""
        response = authenticated_client.get(
            "/api/food-profiles/",
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data["enabled"] is True
        assert response.data["restrictions"] == []

    def test_update_food_profile_restrictions(
        self,
        authenticated_client,
        client_user,
    ):
        """A client must be able to assign multiple restrictions."""
        restrictions = list(Restriction.objects.order_by("id")[:3])

        response = authenticated_client.patch(
            "/api/food-profiles/",
            {
                "restriction_ids": [restriction.id for restriction in restrictions],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        client_user.food_profile.refresh_from_db()

        assert set(
            client_user.food_profile.restrictions.values_list(
                "id",
                flat=True,
            )
        ) == {restriction.id for restriction in restrictions}

    def test_update_food_profile_replaces_existing_restrictions(
        self,
        authenticated_client,
        client_user,
    ):
        """Updating restrictions must replace the previous selection."""
        restrictions = list(Restriction.objects.order_by("id")[:3])

        client_user.food_profile.restrictions.set(restrictions[:2])

        response = authenticated_client.patch(
            "/api/food-profiles/",
            {
                "restriction_ids": [
                    restrictions[2].id,
                ],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        client_user.food_profile.refresh_from_db()

        assert list(
            client_user.food_profile.restrictions.values_list(
                "id",
                flat=True,
            )
        ) == [
            restrictions[2].id,
        ]

    def test_clear_food_profile_restrictions(
        self,
        authenticated_client,
        client_user,
    ):
        """A client must be able to remove all restrictions."""
        restrictions = Restriction.objects.order_by("id")[:2]

        client_user.food_profile.restrictions.set(restrictions)

        response = authenticated_client.patch(
            "/api/food-profiles/",
            {
                "restriction_ids": [],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        client_user.food_profile.refresh_from_db()

        assert client_user.food_profile.restrictions.count() == 0

    def test_disable_food_profile(
        self,
        authenticated_client,
        client_user,
    ):
        """A client must be able to disable their food profile."""
        response = authenticated_client.patch(
            "/api/food-profiles/",
            {
                "enabled": False,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        client_user.food_profile.refresh_from_db()

        assert client_user.food_profile.enabled is False
