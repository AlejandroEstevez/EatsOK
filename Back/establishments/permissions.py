from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        return (
            request.user.is_authenticated
            and request.user.role == request.user.Role.OWNER
        )

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        if request.method in SAFE_METHODS:
            return True

        return obj.owner == request.user


class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        return (
            request.user.is_authenticated
            and request.user.role == request.user.Role.ADMIN
        )


class IsEstablishmentOwnerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated

        return (
            request.user.is_authenticated
            and request.user.role == request.user.Role.OWNER
        )

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        if request.method in SAFE_METHODS:
            return True

        return obj.establishment.owner == request.user
