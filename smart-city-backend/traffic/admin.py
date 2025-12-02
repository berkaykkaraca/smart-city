from django.contrib import admin
from .models import District, Signaller, TrafficEvent, Notification


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ("city_name", "district_name")
    search_fields = ("city_name", "district_name")


@admin.register(Signaller)
class SignallerAdmin(admin.ModelAdmin):
    list_display = ("road_name", "district", "active")
    list_filter = ("active", "district__city_name")
    search_fields = ("road_name",)


@admin.register(TrafficEvent)
class TrafficEventAdmin(admin.ModelAdmin):
    # Yeni model alanlarını buraya ekledik
    list_display = ("get_road_name", "average_kmh", "known_reason", "created_at")
    list_filter = ("created_at", "known_reason", "signaller__district__city_name")
    search_fields = ("signaller__road_name", "known_reason")

    # İlişkili tablodan (Signaller) veri çekmek için yardımcı metod
    def get_road_name(self, obj):
        return obj.signaller.road_name

    get_road_name.short_description = "Road Name"


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("event", "publish_time")
    readonly_fields = ("publish_time",)
