from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from establishments.models import Establishment
from recipes.models import Recipe


class Review(models.Model):
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    establishment = models.ForeignKey(
        Establishment,
        on_delete=models.CASCADE,
        related_name="reviews",
        null=True,
        blank=True,
    )

    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name="reviews",
        null=True,
        blank=True,
    )

    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(5),
        ],
    )

    comment = models.TextField(
        blank=True,
    )

    publication_date = models.DateTimeField(
        auto_now_add=True,
    )

    visible = models.BooleanField(
        default=True,
    )

    def __str__(self):
        return f"{self.author} - {self.rating}/5"
