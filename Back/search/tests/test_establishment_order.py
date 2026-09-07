import pytest
from rest_framework import status


@pytest.mark.django_db
class TestEstablishmentOrder:
    def test_order_by_rating(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get("/api/search/establishments/?ordering=-rating")

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["name"] == "Pizza Roma"
        assert response.data[1]["name"] == "Green Bowl"

    def test_order_by_distance(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            ("/api/search/establishments/?latitude=40.4168&longitude=-3.7038&ordering=distance")
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["name"] == "Pizza Roma"
        assert response.data[0]["distance"] <= (response.data[1]["distance"])

    def test_order_by_compatible_dishes(
        self,
        authenticated_client,
        client_user,
        establishments_data,
        restrictions,
    ):
        client_user.food_profile.restrictions.add(restrictions[0])

        response = authenticated_client.get(
            "/api/search/establishments/?ordering=-compatible_dishes"
        )

        assert response.status_code == status.HTTP_200_OK
        assert response.data[0]["compatible_dishes"] >= (response.data[1]["compatible_dishes"])

    def test_order_by_compatible_percentage(
        self,
        authenticated_client,
        client_user,
        establishments_data,
        restrictions,
    ):
        client_user.food_profile.restrictions.add(restrictions[0])

        response = authenticated_client.get(
            "/api/search/establishments/?ordering=-compatible_percentage"
        )

        assert response.status_code == status.HTTP_200_OK
        assert (
            response.data[0]["compatible_percentage"] >= (response.data[1]["compatible_percentage"])
        )

    def test_invalid_ordering_returns_bad_request(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get("/api/search/establishments/?ordering=invalid")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
