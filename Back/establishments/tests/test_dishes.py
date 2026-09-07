import pytest
from rest_framework import status

from establishments.models import Dish
from food_profiles.models import Restriction


@pytest.mark.django_db
class TestDishes:
    def test_client_can_list_dishes(
        self,
        authenticated_client,
        establishment,
    ):
        Dish.objects.create(
            establishment=establishment,
            name="Ensalada",
            description="Ensalada mediterránea",
            price="12.50",
            available=True,
        )

        response = authenticated_client.get(
            f"/api/establishments/{establishment.id}/dishes/",
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_owner_can_create_dish_with_restrictions(
        self,
        authenticated_owner,
        establishment,
    ):
        restrictions = list(Restriction.objects.order_by("id")[:2])

        response = authenticated_owner.post(
            f"/api/establishments/{establishment.id}/dishes/",
            {
                "name": "Pasta de la casa",
                "description": "Pasta casera",
                "price": "14.00",
                "available": True,
                "dish_restrictions": [
                    {
                        "restriction": restrictions[0].id,
                        "presence_type": "contains",
                    },
                    {
                        "restriction": restrictions[1].id,
                        "presence_type": "traces",
                    },
                ],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        dish = Dish.objects.get(
            name="Pasta de la casa",
        )

        assert dish.dish_restrictions.count() == 2

    def test_owner_cannot_add_dish_to_other_establishment(
        self,
        api_client,
        other_owner,
        establishment,
    ):
        api_client.force_authenticate(
            user=other_owner,
        )

        response = api_client.post(
            f"/api/establishments/{establishment.id}/dishes/",
            {
                "name": "Plato ajeno",
                "description": "",
                "price": "10.00",
                "available": True,
                "dish_restrictions": [],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_owner_can_update_own_dish(
        self,
        authenticated_owner,
        establishment,
    ):
        dish = Dish.objects.create(
            establishment=establishment,
            name="Plato original",
            price="10.00",
        )

        response = authenticated_owner.patch(
            f"/api/establishments/{establishment.id}/dishes/{dish.id}/",
            {
                "name": "Plato actualizado",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        dish.refresh_from_db()

        assert dish.name == "Plato actualizado"

    def test_updating_restrictions_replaces_previous_values(
        self,
        authenticated_owner,
        establishment,
    ):
        restrictions = list(Restriction.objects.order_by("id")[:3])

        dish = Dish.objects.create(
            establishment=establishment,
            name="Plato",
            price="10.00",
        )

        dish.dish_restrictions.create(
            restriction=restrictions[0],
            presence_type="contains",
        )

        response = authenticated_owner.patch(
            f"/api/establishments/{establishment.id}/dishes/{dish.id}/",
            {
                "dish_restrictions": [
                    {
                        "restriction": restrictions[1].id,
                        "presence_type": "traces",
                    },
                    {
                        "restriction": restrictions[2].id,
                        "presence_type": "may_contain",
                    },
                ],
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        assert dish.dish_restrictions.count() == 2
        assert not dish.dish_restrictions.filter(
            restriction=restrictions[0],
        ).exists()
