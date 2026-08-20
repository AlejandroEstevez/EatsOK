import pytest

from rest_framework import status

from establishments.models import Tag


@pytest.mark.django_db
class TestTags:

    def test_authenticated_user_can_list_tags(
        self,
        authenticated_client,
        tag,
    ):
        response = authenticated_client.get(
            "/api/establishments/tags/",
        )

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_client_cannot_create_tag(
        self,
        authenticated_client,
    ):
        response = authenticated_client.post(
            "/api/establishments/tags/",
            {
                "name": "Cafetería",
                "description": "",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_admin_can_create_tag(
        self,
        authenticated_admin,
    ):
        response = authenticated_admin.post(
            "/api/establishments/tags/",
            {
                "name": "Cafetería",
                "description": "Establecimientos tipo cafetería",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED
        assert Tag.objects.filter(
            name="Cafetería",
        ).exists()

    def test_admin_can_delete_tag(
        self,
        authenticated_admin,
        tag,
    ):
        response = authenticated_admin.delete(
            f"/api/establishments/tags/{tag.id}/",
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert not Tag.objects.filter(
            id=tag.id,
        ).exists()
