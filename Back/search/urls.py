from django.urls import path

from .views import EstablishmentSearchView


urlpatterns = [
    path(
        "establishments/",
        EstablishmentSearchView.as_view(),
        name="establishment-search",
    ),
]
