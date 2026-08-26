import pytest

from rest_framework import status

from recipes.models import Recipe


@pytest.mark.django_db
class TestRecipeSearch:

    def test_search_requires_authentication(
        self,
        api_client,
    ):
        """Recipe search must require authentication."""
        response = api_client.get(
            "/api/search/recipes/",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_search_by_recipe_title(
        self,
        authenticated_client,
        recipes_data,
    ):
        """Recipes must be searchable by title."""
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
        """Recipes must be searchable by description."""
        response = authenticated_client.get(
            "/api/search/recipes/?search=verduras"
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Pasta vegetal"

    def test_search_returns_image_url(
        self,
        authenticated_client,
        client_user,
    ):
        """Recipe search results must include the image URL."""
        Recipe.objects.create(
            author=client_user,
            title="Receta con imagen",
            ingredients="Ingrediente",
            steps="Preparar.",
            image_url="https://example.com/recipe.jpg",
        )

        response = authenticated_client.get(
            "/api/search/recipes/?search=Receta con imagen"
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert (
            response.data[0]["image_url"]
            == "https://example.com/recipe.jpg"
        )
