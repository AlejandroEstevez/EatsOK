from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


from .views import MeView, ChangePasswordView, OwnerRegisterView, RegisterView, LogoutView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("owners/", OwnerRegisterView.as_view(), name="owner-register"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
