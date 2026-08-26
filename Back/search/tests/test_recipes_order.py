import pytest

from rest_framework import status

from recipes.models import (
    Recipe,
    RecipeRestriction,
    RecipeRestrictionType,
)


@pytest.mark.django_db
class TestRecipeOrder:

    def test_order_by_rating(
        self,
        authenticated_client,
        recipes_data,
    ):
        """Recipes must be ordered by rating."""
        response = authenticated_client.get(
            "/api/search/recipes/?ordering=-rating"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["title"] == "Tortitas sin gluten"
        assert response.data[1]["title"] == "Pasta vegetal"

    def test_order_by_preparation_time(
        self,
        authenticated_client,
        recipes_data,
    ):
        """Recipes must be ordered by preparation time."""
        response = authenticated_client.get(
            "/api/search/recipes/?ordering=preparation_time"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["title"] == "Tortitas sin gluten"
        assert response.data[1]["title"] == "Pasta vegetal"

    def test_adapted_recipes_are_prioritized(
        self,
        authenticated_client,
        client_user,
        restrictions,
    ):
        """Recipes adapted to active restrictions must appear first."""
        normal_recipe = Recipe.objects.create(
            author=client_user,
            title="Receta normal",
            ingredients="Ingrediente",
            steps="Preparar.",
            preparation_time=10,
        )

        partially_adapted_recipe = Recipe.objects.create(
            author=client_user,
            title="Receta adaptada",
            ingredients="Ingrediente",
            steps="Preparar.",
            preparation_time=20,
        )

        fully_adapted_recipe = Recipe.objects.create(
            author=client_user,
            title="Receta muy adaptada",
            ingredients="Ingrediente",
            steps="Preparar.",
            preparation_time=30,
        )

        RecipeRestriction.objects.create(
            recipe=partially_adapted_recipe,
            restriction=restrictions[0],
            relation_type=RecipeRestrictionType.ADAPTED_FOR,
        )

        RecipeRestriction.objects.create(
            recipe=fully_adapted_recipe,
            restriction=restrictions[0],
            relation_type=RecipeRestrictionType.ADAPTED_FOR,
        )

        RecipeRestriction.objects.create(
            recipe=fully_adapted_recipe,
            restriction=restrictions[1],
            relation_type=RecipeRestrictionType.ADAPTED_FOR,
        )

        client_user.food_profile.restrictions.add(
            restrictions[0],
            restrictions[1],
        )

        response = authenticated_client.get(
            "/api/search/recipes/?ordering=preparation_time"
        )

        assert response.status_code == status.HTTP_200_OK

        assert response.data[0]["title"] == "Receta muy adaptada"
        assert response.data[1]["title"] == "Receta adaptada"
        assert response.data[2]["title"] == "Receta normal"

    def test_invalid_ordering_returns_bad_request(
        self,
        authenticated_client,
        recipes_data,
    ):
        """Invalid ordering values must return a bad request."""
        response = authenticated_client.get(
            "/api/search/recipes/?ordering=invalid"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
