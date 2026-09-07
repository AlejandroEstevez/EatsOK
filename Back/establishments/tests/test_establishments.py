import pytest
from rest_framework import status

from establishments.models import Establishment


@pytest.mark.django_db
class TestEstablishments:
    def test_establishment_list_requires_authentication(
        self,
        api_client,
    ):
        response = api_client.get(
            "/api/establishments/",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_client_can_list_establishments(
        self,
        authenticated_client,
        establishment,
    ):
        response = authenticated_client.get(
            "/api/establishments/",
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_owner_can_create_establishment(
        self,
        authenticated_owner,
        owner_user,
        tag,
    ):
        response = authenticated_owner.post(
            "/api/establishments/",
            {
                "name": "Nuevo restaurante",
                "description": "Descripción",
                "phone": "911111111",
                "email": "nuevo@example.com",
                "opening_time": "10:00:00",
                "closing_time": "22:00:00",
                "cross_contamination": "",
                "restrictions_info": "",
                "active": True,
                "tags": [tag.id],
                "location": {
                    "address": "Calle Mayor, 1",
                    "city": "Madrid",
                    "region": "Madrid",
                    "country": "España",
                    "postal_code": "28001",
                    "latitude": 40.4168,
                    "longitude": -3.7038,
                },
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        establishment = Establishment.objects.get(
            name="Nuevo restaurante",
        )

        assert establishment.owner == owner_user
        assert establishment.location.city == "Madrid"
        assert establishment.tags.filter(
            id=tag.id,
        ).exists()

    def test_client_cannot_create_establishment(
        self,
        authenticated_client,
        tag,
    ):
        response = authenticated_client.post(
            "/api/establishments/",
            {
                "name": "No permitido",
                "description": "Descripción",
                "tags": [tag.id],
                "location": {
                    "address": "Calle X",
                    "city": "Madrid",
                    "region": "Madrid",
                    "country": "España",
                    "postal_code": "28001",
                },
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_owner_can_update_own_establishment(
        self,
        authenticated_owner,
        establishment,
    ):
        response = authenticated_owner.patch(
            f"/api/establishments/{establishment.id}/",
            {
                "name": "Nombre actualizado",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        establishment.refresh_from_db()

        assert establishment.name == "Nombre actualizado"

    def test_owner_cannot_update_other_establishment(
        self,
        api_client,
        other_owner,
        establishment,
    ):
        api_client.force_authenticate(
            user=other_owner,
        )

        response = api_client.patch(
            f"/api/establishments/{establishment.id}/",
            {
                "name": "Intento",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN
