from django.urls import path

from .views import (
    DishDetailView,
    DishListCreateView,
    EstablishmentDetailView,
    EstablishmentListCreateView,
    TagDetailView,
    TagListCreateView,
)


urlpatterns = [
    path(
        "",
        EstablishmentListCreateView.as_view(),
        name="establishment-list-create",
    ),
    path(
        "tags/",
        TagListCreateView.as_view(),
        name="tag-list-create",
    ),
    path(
        "tags/<int:pk>/",
        TagDetailView.as_view(),
        name="tag-detail",
    ),
    path(
        "<int:pk>/",
        EstablishmentDetailView.as_view(),
        name="establishment-detail",
    ),
    path(
        "<int:establishment_id>/dishes/",
        DishListCreateView.as_view(),
        name="dish-list-create",
    ),
    path(
        "<int:establishment_id>/dishes/<int:pk>/",
        DishDetailView.as_view(),
        name="dish-detail",
    ),
]
