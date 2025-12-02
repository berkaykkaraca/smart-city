from django.contrib import admin

from .models import TrafficEvent


@admin.register(TrafficEvent)
class TrafficEventAdmin(admin.ModelAdmin):
    list_display = ("sensor_id", "location", "vehicle_count", "average_speed_kmh", "created_at")
    list_filter = ("location", "sensor_id")
    search_fields = ("sensor_id", "location")
