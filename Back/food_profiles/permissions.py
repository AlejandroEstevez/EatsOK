from rest_framework.permissions import BasePermission


class IsOwnFoodProfile(BasePermission):
    """Allow users to access only their own food profile."""

    def has_object_permission(self, request, view, obj):
        return obj.client == request.user
