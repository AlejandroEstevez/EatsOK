import pytest

from rest_framework import status


@pytest.mark.django_db
class TestEstablishmentFilter:

    def test_profile_restrictions_affect_compatible_dishes(
        self,
        authenticated_client,
        client_user,
        establishments_data,
        restrictions,
    ):
        client_user.food_profile.restrictions.add(
            restrictions[0]
        )

        response = authenticated_client.get(
            "/api/search/establishments/?use_profile=true"
        )

        assert response.status_code == status.HTTP_200_OK

        pizza_result = next(
            result
            for result in response.data
            if result["name"] == "Pizza Roma"
        )

        assert pizza_result["compatible_dishes"] == 1
        assert pizza_result["total_dishes"] == 2
        assert pizza_result["compatible_percentage"] == 50.0

    def test_profile_can_be_disabled_as_filter(
        self,
        authenticated_client,
        client_user,
        establishments_data,
        restrictions,
    ):
        client_user.food_profile.restrictions.add(
            restrictions[0]
        )

        response = authenticated_client.get(
            "/api/search/establishments/?use_profile=false"
        )

        assert response.status_code == status.HTTP_200_OK

        pizza_result = next(
            result
            for result in response.data
            if result["name"] == "Pizza Roma"
        )

        assert pizza_result["compatible_dishes"] == 2
        assert pizza_result["compatible_percentage"] == 100.0

    def test_additional_restrictions_are_applied(
        self,
        authenticated_client,
        establishments_data,
        restrictions,
    ):
        response = authenticated_client.get(
            (
                "/api/search/establishments/"
                f"?restrictions={restrictions[0].id}"
            )
        )

        assert response.status_code == status.HTTP_200_OK

        pizza_result = next(
            result
            for result in response.data
            if result["name"] == "Pizza Roma"
        )

        assert pizza_result["compatible_dishes"] == 1
        assert pizza_result["compatible_percentage"] == 50.0

    def test_profile_and_additional_restrictions_are_combined(
        self,
        authenticated_client,
        client_user,
        establishments_data,
        restrictions,
    ):
        client_user.food_profile.restrictions.add(
            restrictions[0]
        )

        response = authenticated_client.get(
            (
                "/api/search/establishments/"
                f"?use_profile=true&restrictions={restrictions[1].id}"
            )
        )

        assert response.status_code == status.HTTP_200_OK

        pizza_result = next(
            result
            for result in response.data
            if result["name"] == "Pizza Roma"
        )

        assert pizza_result["compatible_dishes"] == 1

    def test_invalid_restriction_id_returns_bad_request(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            "/api/search/establishments/?restrictions=999999"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_use_profile_returns_bad_request(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            "/api/search/establishments/?use_profile=maybe"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_default_radius_filters_far_establishments(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            (
                "/api/search/establishments/"
                "?latitude=40.4168&longitude=-3.7038"
            )
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_custom_radius_filters_establishments(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            (
                "/api/search/establishments/"
                "?latitude=40.4168"
                "&longitude=-3.7038"
                "&radius=0.5"
            )
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == "Pizza Roma"

    def test_coordinates_must_be_provided_together(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            "/api/search/establishments/?latitude=40.4168"
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_coordinates_return_bad_request(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            (
                "/api/search/establishments/"
                "?latitude=invalid"
                "&longitude=-3.7038"
            )
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_invalid_radius_returns_bad_request(
        self,
        authenticated_client,
        establishments_data,
    ):
        response = authenticated_client.get(
            (
                "/api/search/establishments/"
                "?latitude=40.4168"
                "&longitude=-3.7038"
                "&radius=0"
            )
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
