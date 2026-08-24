import pytest

from rest_framework import status


@pytest.mark.django_db
class TestRecipeOrder:

    def test_order_by_rating(
        self,
        authenticated_client,
        recipes_data,
    ):
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
        response = authenticated_client.get(
            "/api/search/recipes/?ordering=preparation_time"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["title"] == "Tortitas sin gluten"
        assert response.data[1]["title"] == "Pasta vegetal"

    def test_invalid_ordering_returns_bad_request(
        self,
        authenticated_client,
        recipes_data,
    ):
        response = authenticated_client.get(
            "/api/search/recipes/?ordering=invalid"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
