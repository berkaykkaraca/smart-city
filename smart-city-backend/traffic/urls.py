from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TrafficEventViewSet

router = DefaultRouter()
router.register(r"events", TrafficEventViewSet, basename="traffic-event")

urlpatterns = [
    path("", include(router.urls)),
]


