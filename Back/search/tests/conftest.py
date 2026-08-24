import pytest

from rest_framework.test import APIClient

from establishments.models import (
    Dish,
    DishRestriction,
    Establishment,
    Location,
    Tag,
)
from food_profiles.models import FoodProfile, Restriction
from recipes.models import Recipe
from reviews.models import Review
from users.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def client_user(db):
    user = User.objects.create_user(
        username="client",
        email="client@example.com",
        password="Password123!",
        role=User.Role.CLIENT,
    )

    FoodProfile.objects.get_or_create(
        client=user,
    )

    return user


@pytest.fixture
def authenticated_client(api_client, client_user):
    api_client.force_authenticate(
        user=client_user,
    )

    return api_client


@pytest.fixture
def restrictions(db):
    return list(
        Restriction.objects.order_by("id")[:3]
    )


@pytest.fixture
def pizza_tag(db):
    return Tag.objects.create(
        name="Italiano",
        description="Comida italiana",
    )


@pytest.fixture
def establishments_data(
    db,
    client_user,
    restrictions,
    pizza_tag,
):
    owner = User.objects.create_user(
        username="owner",
        email="owner@example.com",
        password="Password123!",
        role=User.Role.OWNER,
    )

    pizza = Establishment.objects.create(
        owner=owner,
        name="Pizza Roma",
        description="Restaurante italiano",
        active=True,
    )

    pizza.tags.add(
        pizza_tag,
    )

    Location.objects.create(
        establishment=pizza,
        address="Calle A, 1",
        city="Madrid",
        region="Madrid",
        country="España",
        postal_code="28001",
        latitude=40.4168,
        longitude=-3.7038,
    )

    pizza_dish = Dish.objects.create(
        establishment=pizza,
        name="Pizza margarita",
        price="12.00",
        available=True,
    )

    salad_dish = Dish.objects.create(
        establishment=pizza,
        name="Ensalada",
        price="9.00",
        available=True,
    )

    DishRestriction.objects.create(
        dish=pizza_dish,
        restriction=restrictions[0],
        presence_type="contains",
    )

    green = Establishment.objects.create(
        owner=owner,
        name="Green Bowl",
        description="Comida saludable",
        active=True,
    )

    Location.objects.create(
        establishment=green,
        address="Calle B, 2",
        city="Madrid",
        region="Madrid",
        country="España",
        postal_code="28002",
        latitude=40.4300,
        longitude=-3.7000,
    )

    bowl_dish = Dish.objects.create(
        establishment=green,
        name="Bowl vegetal",
        price="10.00",
        available=True,
    )

    Review.objects.create(
        author=client_user,
        establishment=pizza,
        rating=5,
        visible=True,
    )

    Review.objects.create(
        author=client_user,
        establishment=green,
        rating=3,
        visible=True,
    )

    return {
        "pizza": pizza,
        "green": green,
        "pizza_dish": pizza_dish,
        "salad_dish": salad_dish,
        "bowl_dish": bowl_dish,
    }


@pytest.fixture
def recipes_data(
    db,
    client_user,
    restrictions,
    establishments_data,
):
    recipe_1 = Recipe.objects.create(
        author=client_user,
        title="Tortitas sin gluten",
        description="Desayuno sencillo y rápido",
        ingredients="Harina sin gluten\nHuevos",
        steps="Mezclar y cocinar.",
        preparation_time=15,
        visible=True,
    )

    recipe_1.restrictions.add(
        restrictions[0],
        restrictions[1],
    )

    recipe_2 = Recipe.objects.create(
        author=client_user,
        title="Pasta vegetal",
        description="Receta de pasta con verduras",
        ingredients="Pasta\nVerduras",
        steps="Cocer y mezclar.",
        preparation_time=30,
        visible=True,
        establishment=establishments_data["green"],
    )

    recipe_2.restrictions.add(
        restrictions[1],
    )

    Review.objects.create(
        author=client_user,
        recipe=recipe_1,
        rating=5,
        visible=True,
    )

    Review.objects.create(
        author=client_user,
        recipe=recipe_2,
        rating=3,
        visible=True,
    )

    return {
        "tortitas": recipe_1,
        "pasta": recipe_2,
    }
