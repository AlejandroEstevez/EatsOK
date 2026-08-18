from django.conf import settings
from django.db import models


class Restriction(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )

    def __str__(self):
        return self.name


class Allergy(Restriction):
    class AllergyType(models.TextChoices):
        GLUTEN = "GLUTEN", "Gluten"
        CRUSTACEANS = "CRUSTACEANS", "Crustáceos"
        EGGS = "EGGS", "Huevos"
        FISH = "FISH", "Pescado"
        PEANUTS = "PEANUTS", "Cacahuetes"
        SOY = "SOY", "Soja"
        DAIRY = "DAIRY", "Lácteos"
        NUTS = "NUTS", "Frutos de cáscara"
        CELERY = "CELERY", "Apio"
        MUSTARD = "MUSTARD", "Mostaza"
        SESAME = "SESAME", "Semillas de sésamo"
        SULPHITES = "SULPHITES", "Dióxido de azufre y sulfitos"
        LUPIN = "LUPIN", "Altramuces"
        MOLLUSCS = "MOLLUSCS", "Moluscos"

    allergy_type = models.CharField(
        max_length=30,
        choices=AllergyType.choices,
        unique=True,
    )


class Diet(Restriction):
    class DietType(models.TextChoices):
        VEGETARIAN = "VEGETARIAN", "Vegetariano"
        VEGAN = "VEGAN", "Vegano"
        PESCETARIAN = "PESCETARIAN", "Pescetariano"
        HALAL = "HALAL", "Halal"
        KOSHER = "KOSHER", "Kosher"

    diet_type = models.CharField(
        max_length=30,
        choices=DietType.choices,
        unique=True,
    )


class FoodProfile(models.Model):
    client = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="food_profile",
    )

    restrictions = models.ManyToManyField(
        Restriction,
        through="FoodProfileRestriction",
        related_name="food_profiles",
        blank=True,
    )

    modified_at = models.DateTimeField(
        auto_now=True,
    )

    enabled = models.BooleanField(
        default=True,
    )

    def __str__(self):
        return f"Food profile - {self.client}"


class FoodProfileRestriction(models.Model):
    food_profile = models.ForeignKey(
        FoodProfile,
        on_delete=models.CASCADE,
        related_name="profile_restrictions",
    )

    restriction = models.ForeignKey(
        Restriction,
        on_delete=models.CASCADE,
        related_name="profile_restrictions",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["food_profile", "restriction"],
                name="unique_food_profile_restriction",
            )
        ]
