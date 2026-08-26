import pytest

from rest_framework import status

from recipes.models import (
    Recipe,
    RecipeRestriction,
    RecipeRestrictionType,
)


@pytest.mark.django_db
class TestRecipeFilter:

    def test_profile_blocking_restriction_excludes_recipe(
        self,
        authenticated_client,
        client_user,
        restrictions,
    ):
        """Recipes blocked by a profile restriction must be excluded."""
        blocked_recipe = Recipe.objects.create(
            author=client_user,
            title="Receta con gluten",
            ingredients="Harina de trigo",
            steps="Preparar.",
        )

        allowed_recipe = Recipe.objects.create(
            author=client_user,
            title="Receta permitida",
            ingredients="Arroz",
            steps="Preparar.",
        )

        RecipeRestriction.objects.create(
            recipe=blocked_recipe,
            restriction=restrictions[0],
            relation_type=RecipeRestrictionType.BLOCKS,
        )

        client_user.food_profile.restrictions.add(
            restrictions[0]
        )

        response = authenticated_client.get(
            "/api/search/recipes/?use_profile=true"
        )

        assert response.status_code == status.HTTP_200_OK

        titles = [
            recipe["title"]
            for recipe in response.data
        ]

        assert blocked_recipe.title not in titles
        assert allowed_recipe.title in titles

    def test_adapted_restriction_does_not_exclude_recipe(
        self,
        authenticated_client,
        client_user,
        restrictions,
    ):
        """Recipes adapted for a restriction must remain compatible."""
        adapted_recipe = Recipe.objects.create(
            author=client_user,
            title="Receta adaptada",
            ingredients="Ingredientes adaptados",
            steps="Preparar.",
        )

        RecipeRestriction.objects.create(
            recipe=adapted_recipe,
            restriction=restrictions[0],
            relation_type=RecipeRestrictionType.ADAPTED_FOR,
        )

        client_user.food_profile.restrictions.add(
            restrictions[0]
        )

        response = authenticated_client.get(
            "/api/search/recipes/?use_profile=true"
        )

        assert response.status_code == status.HTTP_200_OK

        titles = [
            recipe["title"]
            for recipe in response.data
        ]

        assert adapted_recipe.title in titles

    def test_profile_can_be_disabled_as_filter(
        self,
        authenticated_client,
        client_user,
        restrictions,
    ):
        """Profile restrictions must be ignored when use_profile is false."""
        recipe = Recipe.objects.create(
            author=client_user,
            title="Receta bloqueada por perfil",
            ingredients="Ingrediente",
            steps="Preparar.",
        )

        RecipeRestriction.objects.create(
            recipe=recipe,
            restriction=restrictions[0],
            relation_type=RecipeRestrictionType.BLOCKS,
        )

        client_user.food_profile.restrictions.add(
            restrictions[0]
        )

        response = authenticated_client.get(
            "/api/search/recipes/?use_profile=false"
        )

        assert response.status_code == status.HTTP_200_OK

        titles = [
            recipe["title"]
            for recipe in response.data
        ]

        assert recipe.title in titles

    def test_additional_blocking_restrictions_are_applied(
        self,
        authenticated_client,
        client_user,
        restrictions,
    ):
        """Additional restrictions must exclude blocked recipes."""
        blocked_recipe = Recipe.objects.create(
            author=client_user,
            title="Receta bloqueada",
            ingredients="Ingrediente",
            steps="Preparar.",
        )

        allowed_recipe = Recipe.objects.create(
            author=client_user,
            title="Receta permitida",
            ingredients="Ingrediente",
            steps="Preparar.",
        )

        RecipeRestriction.objects.create(
            recipe=blocked_recipe,
            restriction=restrictions[0],
            relation_type=RecipeRestrictionType.BLOCKS,
        )

        response = authenticated_client.get(
            (
                "/api/search/recipes/"
                f"?use_profile=false&restrictions={restrictions[0].id}"
            )
        )

        assert response.status_code == status.HTTP_200_OK

        titles = [
            recipe["title"]
            for recipe in response.data
        ]

        assert blocked_recipe.title not in titles
        assert allowed_recipe.title in titles

    def test_profile_and_additional_restrictions_are_combined(
        self,
        authenticated_client,
        client_user,
        restrictions,
    ):
        """Profile and additional restrictions must be applied together."""
        profile_blocked_recipe = Recipe.objects.create(
            author=client_user,
            title="Bloqueada por perfil",
            ingredients="Ingrediente",
            steps="Preparar.",
        )

        additional_blocked_recipe = Recipe.objects.create(
            author=client_user,
            title="Bloqueada adicional",
            ingredients="Ingrediente",
            steps="Preparar.",
        )

        allowed_recipe = Recipe.objects.create(
            author=client_user,
            title="Receta compatible",
            ingredients="Ingrediente",
            steps="Preparar.",
        )

        RecipeRestriction.objects.create(
            recipe=profile_blocked_recipe,
            restriction=restrictions[0],
            relation_type=RecipeRestrictionType.BLOCKS,
        )

        RecipeRestriction.objects.create(
            recipe=additional_blocked_recipe,
            restriction=restrictions[1],
            relation_type=RecipeRestrictionType.BLOCKS,
        )

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

        titles = [
            recipe["title"]
            for recipe in response.data
        ]

        assert profile_blocked_recipe.title not in titles
        assert additional_blocked_recipe.title not in titles
        assert allowed_recipe.title in titles

    def test_invalid_restriction_id_returns_bad_request(
        self,
        authenticated_client,
    ):
        """Unknown restriction IDs must return a bad request."""
        response = authenticated_client.get(
            "/api/search/recipes/?restrictions=999999"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_use_profile_returns_bad_request(
        self,
        authenticated_client,
    ):
        """Invalid use_profile values must return a bad request."""
        response = authenticated_client.get(
            "/api/search/recipes/?use_profile=maybe"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
