from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated

from .models import Restriction
from .serializers import (
    FoodProfileSerializer,
    RestrictionSerializer,
)


class FoodProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = FoodProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        if self.request.user.role != self.request.user.Role.CLIENT:
            raise PermissionDenied("Only clients have a food profile.")

        return self.request.user.food_profile


class RestrictionListView(generics.ListAPIView):
    queryset = Restriction.objects.all().order_by("id")
    serializer_class = RestrictionSerializer
    permission_classes = [IsAuthenticated]
