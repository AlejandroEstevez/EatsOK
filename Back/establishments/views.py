from django.shortcuts import get_object_or_404

from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import (
    Dish,
    Establishment,
    Tag,
)
from .permissions import (
    IsAdminOrReadOnly,
    IsEstablishmentOwnerOrReadOnly,
    IsOwnerOrReadOnly,
)
from .serializers import (
    DishSerializer,
    EstablishmentSerializer,
    TagSerializer,
)


class EstablishmentListCreateView(generics.ListCreateAPIView):
    queryset = Establishment.objects.all()
    serializer_class = EstablishmentSerializer
    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReadOnly,
    ]

    def perform_create(self, serializer):
        serializer.save(
            owner=self.request.user,
        )


class EstablishmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Establishment.objects.all()
    serializer_class = EstablishmentSerializer
    permission_classes = [
        IsAuthenticated,
        IsOwnerOrReadOnly,
    ]


class DishListCreateView(generics.ListCreateAPIView):
    serializer_class = DishSerializer
    permission_classes = [
        IsAuthenticated,
        IsEstablishmentOwnerOrReadOnly,
    ]

    def get_queryset(self):
        return Dish.objects.filter(
            establishment_id=self.kwargs["establishment_id"],
        )

    def perform_create(self, serializer):
        establishment = get_object_or_404(
            Establishment,
            pk=self.kwargs["establishment_id"],
        )

        if establishment.owner != self.request.user:
            raise PermissionDenied(
                "You can only add dishes to your own establishments."
            )

        serializer.save(
            establishment=establishment,
        )


class DishDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DishSerializer
    permission_classes = [
        IsAuthenticated,
        IsEstablishmentOwnerOrReadOnly,
    ]

    def get_queryset(self):
        return Dish.objects.filter(
            establishment_id=self.kwargs["establishment_id"],
        )


class TagListCreateView(generics.ListCreateAPIView):
    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer
    permission_classes = [
        IsAuthenticated,
        IsAdminOrReadOnly,
    ]


class TagDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [
        IsAuthenticated,
        IsAdminOrReadOnly,
    ]
