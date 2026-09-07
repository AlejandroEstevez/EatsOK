from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import Review
from .serializers import ReviewModerationSerializer, ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        queryset = Review.objects.filter(
            visible=True,
        ).select_related(
            "author",
            "establishment",
            "recipe",
        )

        establishment_id = self.request.query_params.get("establishment")

        recipe_id = self.request.query_params.get("recipe")

        if establishment_id:
            queryset = queryset.filter(establishment_id=establishment_id)

        if recipe_id:
            queryset = queryset.filter(recipe_id=recipe_id)

        return queryset.order_by("-publication_date")

    def perform_create(self, serializer):
        user = self.request.user

        if user.role != user.Role.CLIENT:
            raise PermissionDenied("Only clients can publish reviews.")

        serializer.save(
            author=user,
        )


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def perform_update(self, serializer):
        review = self.get_object()
        user = self.request.user

        if review.author != user:
            raise PermissionDenied("You can only modify your own reviews.")

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        if instance.author != user and user.role != user.Role.ADMIN:
            raise PermissionDenied("You can only delete your own reviews.")

        instance.delete()


class ReviewModerationView(generics.UpdateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewModerationSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def perform_update(self, serializer):
        user = self.request.user

        if user.role != user.Role.ADMIN:
            raise PermissionDenied("Only administrators can moderate reviews.")

        serializer.save()
