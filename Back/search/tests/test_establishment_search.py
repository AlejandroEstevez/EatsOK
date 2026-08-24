import pytest

from rest_framework import status


@pytest.mark.django_db
class TestEstablishmentSearch:

    def test_search_requires_authentication(
        self,
        api_client,
    ):
        response = api_client.get(
            "/api/search/establishments/",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_search_by_establishment_name(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            "/api/search/establishments/?search=roma"
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Pizza Roma"

    def test_search_by_dish_name(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            "/api/search/establishments/?search=margarita"
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Pizza Roma"

    def test_search_by_tag(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            "/api/search/establishments/?search=italiano"
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Pizza Roma"
