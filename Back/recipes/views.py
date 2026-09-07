from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import Recipe
from .serializers import RecipeSerializer


class RecipeListCreateView(generics.ListCreateAPIView):
    serializer_class = RecipeSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):
        return Recipe.objects.filter(
            visible=True,
        )

    def perform_create(self, serializer):
        user = self.request.user

        if user.role not in [
            user.Role.CLIENT,
            user.Role.OWNER,
        ]:
            raise PermissionDenied("Only clients and owners can publish recipes.")

        serializer.save(
            author=user,
        )


class RecipeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [
        IsAuthenticated,
    ]

    def perform_update(self, serializer):
        if self.get_object().author != self.request.user:
            raise PermissionDenied("You can only modify your own recipes.")

        serializer.save()

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("You can only delete your own recipes.")

        instance.delete()
