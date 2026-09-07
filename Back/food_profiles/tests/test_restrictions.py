import pytest
from rest_framework import status

from food_profiles.models import Restriction


@pytest.mark.django_db
class TestRestrictions:
    def test_restrictions_requires_authentication(
        self,
        api_client,
    ):
        """Unauthenticated users must not access the restriction catalogue."""
        response = api_client.get(
            "/api/food-profiles/restrictions/",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_restrictions_returns_catalogue(
        self,
        authenticated_client,
    ):
        """Authenticated users must receive the predefined restrictions."""
        response = authenticated_client.get(
            "/api/food-profiles/restrictions/",
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == Restriction.objects.count()
        assert len(response.data) == 19

        assert all(
            "id" in restriction and "name" in restriction and "type" in restriction
            for restriction in response.data
        )

    def test_restrictions_contains_allergies_and_diets(
        self,
        authenticated_client,
    ):
        """The catalogue must distinguish allergies and dietary preferences."""
        response = authenticated_client.get(
            "/api/food-profiles/restrictions/",
        )

        types = {restriction["type"] for restriction in response.data}

        assert "allergy" in types
        assert "diet" in types
