from django.conf import settings
from django.db import models

from food_profiles.models import Restriction


class Tag(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )
    description = models.TextField(
        blank=True,
    )

    def __str__(self):
        return self.name


class Establishment(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="establishments",
    )

    name = models.CharField(
        max_length=150,
    )

    description = models.TextField()

    phone = models.CharField(
        max_length=30,
        blank=True,
    )

    email = models.EmailField(
        blank=True,
    )

    opening_time = models.TimeField(
        null=True,
        blank=True,
    )

    closing_time = models.TimeField(
        null=True,
        blank=True,
    )

    cross_contamination = models.TextField(
        blank=True,
    )

    restrictions_info = models.TextField(
        blank=True,
    )

    active = models.BooleanField(
        default=True,
    )

    tags = models.ManyToManyField(
        Tag,
        related_name="establishments",
        blank=True,
    )

    image_url = models.URLField(
        blank=True,
    )

    def __str__(self):
        return self.name


class Location(models.Model):
    establishment = models.OneToOneField(
        Establishment,
        on_delete=models.CASCADE,
        related_name="location",
    )

    address = models.CharField(
        max_length=255,
    )

    city = models.CharField(
        max_length=100,
    )

    region = models.CharField(
        max_length=100,
    )

    country = models.CharField(
        max_length=100,
    )

    postal_code = models.CharField(
        max_length=20,
    )

    latitude = models.FloatField(
        null=True,
        blank=True,
    )

    longitude = models.FloatField(
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.address}, {self.city}"


class Dish(models.Model):
    establishment = models.ForeignKey(
        Establishment,
        on_delete=models.CASCADE,
        related_name="dishes",
    )

    name = models.CharField(
        max_length=150,
    )

    description = models.TextField(
        blank=True,
    )

    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
    )

    available = models.BooleanField(
        default=True,
    )

    restrictions = models.ManyToManyField(
        Restriction,
        through="DishRestriction",
        related_name="dishes",
        blank=True,
    )

    image_url = models.URLField(
        blank=True,
    )

    def __str__(self):
        return self.name


class DishRestriction(models.Model):
    class PresenceType(models.TextChoices):
        CONTAINS = "contains", "Contiene"
        MAY_CONTAIN = "may_contain", "Puede contener"
        TRACES = "traces", "Trazas"

    dish = models.ForeignKey(
        Dish,
        on_delete=models.CASCADE,
        related_name="dish_restrictions",
    )

    restriction = models.ForeignKey(
        Restriction,
        on_delete=models.CASCADE,
        related_name="dish_restrictions",
    )

    presence_type = models.CharField(
        max_length=20,
        choices=PresenceType.choices,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "dish",
                    "restriction",
                ],
                name="unique_dish_restriction",
            ),
        ]

    def __str__(self):
        return f"{self.dish} - {self.restriction} ({self.presence_type})"
