import pytest
from rest_framework import status

from reviews.models import Review


@pytest.mark.django_db
class TestReviews:
    def test_reviews_require_authentication(
        self,
        api_client,
    ):
        """Unauthenticated users must not access reviews."""
        response = api_client.get(
            "/api/reviews/",
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_client_can_review_establishment(
        self,
        authenticated_client,
        client_user,
        establishment,
    ):
        """Clients must be able to review establishments."""
        response = authenticated_client.post(
            "/api/reviews/",
            {
                "establishment": establishment.id,
                "rating": 4,
                "comment": "Muy atentos con las restricciones.",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        review = Review.objects.get(
            establishment=establishment,
            author=client_user,
        )

        assert review.rating == 4
        assert review.comment == "Muy atentos con las restricciones."

    def test_client_can_review_recipe(
        self,
        authenticated_client,
        client_user,
        recipe,
    ):
        """Clients must be able to review recipes."""
        response = authenticated_client.post(
            "/api/reviews/",
            {
                "recipe": recipe.id,
                "rating": 5,
                "comment": "Muy fácil de preparar.",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

        assert Review.objects.filter(
            recipe=recipe,
            author=client_user,
        ).exists()

    def test_review_comment_is_optional(
        self,
        authenticated_client,
        recipe,
    ):
        """A numerical rating may be published without a comment."""
        response = authenticated_client.post(
            "/api/reviews/",
            {
                "recipe": recipe.id,
                "rating": 5,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_201_CREATED

    def test_rating_must_be_between_zero_and_five(
        self,
        authenticated_client,
        recipe,
    ):
        """Ratings outside the allowed range must be rejected."""
        response = authenticated_client.post(
            "/api/reviews/",
            {
                "recipe": recipe.id,
                "rating": 6,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_review_requires_exactly_one_target(
        self,
        authenticated_client,
        establishment,
        recipe,
    ):
        """A review cannot target both a recipe and an establishment."""
        response = authenticated_client.post(
            "/api/reviews/",
            {
                "establishment": establishment.id,
                "recipe": recipe.id,
                "rating": 4,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_review_requires_target(
        self,
        authenticated_client,
    ):
        """A review must target either a recipe or an establishment."""
        response = authenticated_client.post(
            "/api/reviews/",
            {
                "rating": 4,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_owner_cannot_publish_review(
        self,
        authenticated_owner,
        establishment,
    ):
        """Only clients may publish reviews."""
        response = authenticated_owner.post(
            "/api/reviews/",
            {
                "establishment": establishment.id,
                "rating": 5,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_client_cannot_review_same_establishment_twice(
        self,
        authenticated_client,
        client_user,
        establishment,
    ):
        """A client must not create multiple reviews for the same establishment."""
        Review.objects.create(
            author=client_user,
            establishment=establishment,
            rating=4,
        )

        response = authenticated_client.post(
            "/api/reviews/",
            {
                "establishment": establishment.id,
                "rating": 5,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_client_can_update_own_review(
        self,
        authenticated_client,
        client_user,
        establishment,
    ):
        """Clients must be able to modify their own reviews."""
        review = Review.objects.create(
            author=client_user,
            establishment=establishment,
            rating=3,
            comment="Comentario original.",
        )

        response = authenticated_client.patch(
            f"/api/reviews/{review.id}/",
            {
                "rating": 5,
                "comment": "Comentario actualizado.",
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        review.refresh_from_db()

        assert review.rating == 5
        assert review.comment == "Comentario actualizado."

    def test_client_cannot_update_other_users_review(
        self,
        api_client,
        client_user,
        other_client,
        establishment,
    ):
        """Clients must not modify reviews published by other users."""
        review = Review.objects.create(
            author=client_user,
            establishment=establishment,
            rating=4,
        )

        api_client.force_authenticate(
            user=other_client,
        )

        response = api_client.patch(
            f"/api/reviews/{review.id}/",
            {
                "rating": 1,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_client_can_delete_own_review(
        self,
        authenticated_client,
        client_user,
        recipe,
    ):
        """Clients must be able to delete their own reviews."""
        review = Review.objects.create(
            author=client_user,
            recipe=recipe,
            rating=5,
        )

        response = authenticated_client.delete(
            f"/api/reviews/{review.id}/",
        )

        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert not Review.objects.filter(
            id=review.id,
        ).exists()

    def test_client_cannot_delete_other_users_review(
        self,
        api_client,
        client_user,
        other_client,
        recipe,
    ):
        """Clients must not delete reviews published by other users."""
        review = Review.objects.create(
            author=client_user,
            recipe=recipe,
            rating=5,
        )

        api_client.force_authenticate(
            user=other_client,
        )

        response = api_client.delete(
            f"/api/reviews/{review.id}/",
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

        assert Review.objects.filter(
            id=review.id,
        ).exists()

    def test_admin_can_hide_review(
        self,
        authenticated_admin,
        client_user,
        establishment,
    ):
        """Administrators must be able to hide inappropriate reviews."""
        review = Review.objects.create(
            author=client_user,
            establishment=establishment,
            rating=1,
            comment="Contenido a moderar.",
            visible=True,
        )

        response = authenticated_admin.patch(
            f"/api/reviews/{review.id}/moderation/",
            {
                "visible": False,
            },
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK

        review.refresh_from_db()

        assert review.visible is False

        def test_hidden_reviews_are_not_listed(
            self,
            authenticated_client,
            client_user,
            establishment,
            recipe,
        ):
            """Hidden reviews must not appear in the public review list."""
            Review.objects.create(
                author=client_user,
                establishment=establishment,
                rating=5,
                visible=True,
            )

            Review.objects.create(
                author=client_user,
                recipe=recipe,
                rating=1,
                visible=False,
            )

            response = authenticated_client.get(
                "/api/reviews/",
            )

            assert response.status_code == status.HTTP_200_OK
            assert len(response.data) == 1
            assert response.data[0]["visible"] is True
