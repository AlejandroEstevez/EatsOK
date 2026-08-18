from django.urls import path

from .views import (
    FoodProfileView,
    RestrictionListView,
)


urlpatterns = [
    path(
        "",
        FoodProfileView.as_view(),
        name="food-profile",
    ),
    path(
        "restrictions/",
        RestrictionListView.as_view(),
        name="restriction-list",
    ),
]
