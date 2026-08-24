import pytest

from rest_framework import status


@pytest.mark.django_db
class TestRecipeFilter:

    def test_profile_restrictions_filter_recipes(
        self,
        authenticated_client,
        client_user,
        recipes_data,
        restrictions,
    ):
        client_user.food_profile.restrictions.add(
            restrictions[0]
        )

        response = authenticated_client.get(
            "/api/search/recipes/?use_profile=true"
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Tortitas sin gluten"

    def test_profile_can_be_disabled_as_filter(
        self,
        authenticated_client,
        client_user,
        recipes_data,
        restrictions,
    ):
        client_user.food_profile.restrictions.add(
            restrictions[0]
        )

        response = authenticated_client.get(
            "/api/search/recipes/?use_profile=false"
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_additional_restrictions_are_applied(
        self,
        authenticated_client,
        recipes_data,
        restrictions,
    ):
        response = authenticated_client.get(
            (
                "/api/search/recipes/"
                f"?restrictions={restrictions[0].id}"
            )
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Tortitas sin gluten"

    def test_profile_and_additional_restrictions_are_combined(
        self,
        authenticated_client,
        client_user,
        recipes_data,
        restrictions,
    ):
        client_user.food_profile.restrictions.add(
            restrictions[0]
        )

        response = authenticated_client.get(
            (
                "/api/search/recipes/"
                f"?use_profile=true&restrictions={restrictions[1].id}"
            )
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Tortitas sin gluten"

    def test_invalid_restriction_id_returns_bad_request(
        self,
        authenticated_client,
        recipes_data,
    ):
        response = authenticated_client.get(
            "/api/search/recipes/?restrictions=999999"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_use_profile_returns_bad_request(
        self,
        authenticated_client,
        recipes_data,
    ):
        response = authenticated_client.get(
            "/api/search/recipes/?use_profile=maybe"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
