import pytest

from rest_framework import status


@pytest.mark.django_db
class TestRecipeSearch:

    def test_search_requires_authentication(
        self,
        api_client,
    ):
        response = api_client.get(
            "/api/search/recipes/",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_search_by_recipe_title(
        self,
        authenticated_client,
        recipes_data,
    ):
        response = authenticated_client.get(
            "/api/search/recipes/?search=tortitas"
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Tortitas sin gluten"

    def test_search_by_recipe_description(
        self,
        authenticated_client,
        recipes_data,
    ):
        response = authenticated_client.get(
            "/api/search/recipes/?search=verduras"
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Pasta vegetal"
