from rest_framework import serializers
from .models import District, Signaller, TrafficEvent, Notification


class TrafficEventSerializer(serializers.ModelSerializer):
    # Frontend'den string olarak gelecek alanlar
    city_name = serializers.CharField(write_only=True)
    district_name = serializers.CharField(write_only=True)
    road_name = serializers.CharField(write_only=True)

    # Okuma yaparken (GET) detaylı bilgi göstermek için
    signaller_detail = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TrafficEvent
        fields = [
            "id",
            "city_name",
            "district_name",
            "road_name",  # Yazma alanları
            "average_kmh",
            "known_reason",
            "expected_resolution_time",
            "created_at",
            "signaller_detail",  # Okuma alanı
        ]

    def get_signaller_detail(self, obj):
        return {
            "city": obj.signaller.district.city_name,
            "district": obj.signaller.district.district_name,
            "road": obj.signaller.road_name,
        }

    def create(self, validated_data):
        # İlişkisel verileri ayıkla ve yönet (Get or Create mantığı)
        city = validated_data.pop("city_name")
        dist = validated_data.pop("district_name")
        road = validated_data.pop("road_name")

        # 1. District Bul veya Oluştur
        district_obj, _ = District.objects.get_or_create(
            city_name=city, district_name=dist
        )

        # 2. Signaller Bul veya Oluştur
        signaller_obj, _ = Signaller.objects.get_or_create(
            district=district_obj, road_name=road
        )

        # 3. TrafficEvent Oluştur
        event = TrafficEvent.objects.create(signaller=signaller_obj, **validated_data)

        # 4. Notification Oluştur (Otomatik)
        Notification.objects.create(event=event)

        return event
