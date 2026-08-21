from django.conf import settings
from django.db import models

from establishments.models import Establishment
from food_profiles.models import Restriction


class Recipe(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="recipes",
    )

    establishment = models.ForeignKey(
        Establishment,
        on_delete=models.SET_NULL,
        related_name="recipes",
        null=True,
        blank=True,
    )

    title = models.CharField(
        max_length=150,
    )

    description = models.TextField(
        blank=True,
    )

    ingredients = models.TextField()

    steps = models.TextField()

    preparation_time = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    publication_date = models.DateTimeField(
        auto_now_add=True,
    )

    visible = models.BooleanField(
        default=True,
    )

    restrictions = models.ManyToManyField(
        Restriction,
        through="RecipeRestriction",
        related_name="recipes",
        blank=True,
    )

    def __str__(self):
        return self.title


class RecipeRestriction(models.Model):
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name="recipe_restrictions",
    )

    restriction = models.ForeignKey(
        Restriction,
        on_delete=models.CASCADE,
        related_name="recipe_restrictions",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "recipe",
                    "restriction",
                ],
                name="unique_recipe_restriction",
            ),
        ]

    def __str__(self):
        return f"{self.recipe} - {self.restriction}"
