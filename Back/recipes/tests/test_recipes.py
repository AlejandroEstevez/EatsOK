import pytest
from rest_framework import status

from food_profiles.models import Restriction
from recipes.models import Recipe


@pytest.mark.django_db
class TestRecipes:
    def test_recipe_list_requires_authentication(
        self,
        api_client,
    ):
        """Unauthenticated users must not access recipes."""
        response = api_client.get(
            "/api/recipes/",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_client_can_create_recipe(
        self,
        authenticated_client,
        client_user,
    ):
        """Clients must be able to publish recipes."""
        restrictions = list(Restriction.objects.order_by("id")[:2])

        response = authenticated_client.post(
            "/api/recipes/",
            {
                "title": "Tortitas sin gluten",
                "description": "Tortitas adaptadas.",
                "ingredients": "Harina sin gluten\nHuevos\nLeche",
                "steps": "Mezclar ingredientes y cocinar.",
                "preparation_time": 20,
                "restrictions": [restriction.id for restriction in restrictions],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        recipe = Recipe.objects.get(
            title="Tortitas sin gluten",
        )

        assert recipe.author == client_user
        assert recipe.restrictions.count() == 2

    def test_owner_can_create_recipe_with_own_establishment(
        self,
        authenticated_owner,
        owner_user,
        owner_establishment,
    ):
        """Owners may associate recipes with their own establishment."""
        response = authenticated_owner.post(
            "/api/recipes/",
            {
                "title": "Ensalada de la casa",
                "description": "Receta del establecimiento.",
                "ingredients": "Lechuga\nTomate\nAceite",
                "steps": "Mezclar todos los ingredientes.",
                "preparation_time": 10,
                "establishment": owner_establishment.id,
                "restrictions": [],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        recipe = Recipe.objects.get(
            title="Ensalada de la casa",
        )

        assert recipe.author == owner_user
        assert recipe.establishment == owner_establishment

    def test_client_cannot_associate_recipe_with_establishment(
        self,
        authenticated_client,
        owner_establishment,
    ):
        """Clients must not associate recipes with establishments."""
        response = authenticated_client.post(
            "/api/recipes/",
            {
                "title": "Receta inválida",
                "description": "",
                "ingredients": "Ingrediente",
                "steps": "Paso",
                "establishment": owner_establishment.id,
                "restrictions": [],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_owner_cannot_associate_recipe_with_other_establishment(
        self,
        authenticated_owner,
        other_owner_establishment,
    ):
        """Owners may only associate recipes with their own establishments."""
        response = authenticated_owner.post(
            "/api/recipes/",
            {
                "title": "Receta inválida",
                "description": "",
                "ingredients": "Ingrediente",
                "steps": "Paso",
                "establishment": other_owner_establishment.id,
                "restrictions": [],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_authenticated_user_can_list_visible_recipes(
        self,
        authenticated_client,
        client_user,
    ):
        """Authenticated users must be able to consult visible recipes."""
        Recipe.objects.create(
            author=client_user,
            title="Receta visible",
            ingredients="Ingrediente",
            steps="Paso",
            visible=True,
        )

        Recipe.objects.create(
            author=client_user,
            title="Receta oculta",
            ingredients="Ingrediente",
            steps="Paso",
            visible=False,
        )

        response = authenticated_client.get(
            "/api/recipes/",
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["title"] == "Receta visible"

    def test_author_can_update_own_recipe(
        self,
        authenticated_client,
        client_user,
    ):
        """Authors must be able to modify their own recipes."""
        recipe = Recipe.objects.create(
            author=client_user,
            title="Título original",
            ingredients="Ingrediente",
            steps="Paso",
        )

        response = authenticated_client.patch(
            f"/api/recipes/{recipe.id}/",
            {
                "title": "Título actualizado",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        recipe.refresh_from_db()

        assert recipe.title == "Título actualizado"

    def test_user_cannot_update_other_users_recipe(
        self,
        api_client,
        client_user,
        other_client,
    ):
        """Users must not modify recipes published by other users."""
        recipe = Recipe.objects.create(
            author=client_user,
            title="Receta ajena",
            ingredients="Ingrediente",
            steps="Paso",
        )

        api_client.force_authenticate(
            user=other_client,
        )

        response = api_client.patch(
            f"/api/recipes/{recipe.id}/",
            {
                "title": "Intento de modificación",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_author_can_delete_own_recipe(
        self,
        authenticated_client,
        client_user,
    ):
        """Authors must be able to delete their own recipes."""
        recipe = Recipe.objects.create(
            author=client_user,
            title="Receta a eliminar",
            ingredients="Ingrediente",
            steps="Paso",
        )

        response = authenticated_client.delete(
            f"/api/recipes/{recipe.id}/",
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert not Recipe.objects.filter(
            id=recipe.id,
        ).exists()

    def test_user_cannot_delete_other_users_recipe(
        self,
        api_client,
        client_user,
        other_client,
    ):
        """Users must not delete recipes published by other users."""
        recipe = Recipe.objects.create(
            author=client_user,
            title="Receta protegida",
            ingredients="Ingrediente",
            steps="Paso",
        )

        api_client.force_authenticate(
            user=other_client,
        )

        response = api_client.delete(
            f"/api/recipes/{recipe.id}/",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

        assert Recipe.objects.filter(
            id=recipe.id,
        ).exists()
