from django.urls import path

from .views import EstablishmentSearchView, RecipeSearchView


urlpatterns = [
    path(
        "establishments/",
        EstablishmentSearchView.as_view(),
        name="establishment-search",
    ),
    path(
        "recipes/",
        RecipeSearchView.as_view(),
        name="recipe-search",
    ),
]
