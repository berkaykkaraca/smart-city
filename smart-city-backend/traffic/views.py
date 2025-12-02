from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import TrafficEvent
from .serializers import TrafficEventSerializer
from .pubsub import publish_traffic_event


class TrafficEventViewSet(viewsets.ModelViewSet):
    """
    REST API for traffic events.

    - POST /api/events/       → create event and (optionally) publish to Pub/Sub
    - GET  /api/events/       → list recent events
    - POST /api/events/publish-only/ → publish to Pub/Sub without saving to DB
    """

    queryset = TrafficEvent.objects.all()
    serializer_class = TrafficEventSerializer

    def create(self, request, *args, **kwargs):
        """
        Override create to both save to DB and publish to Pub/Sub.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()

        # send to Pub/Sub; failures are logged but don't break the API
        publish_traffic_event(serializer.data)

        headers = self.get_success_headers(serializer.data)
        return Response(
            TrafficEventSerializer(event).data,
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

    @action(detail=False, methods=["post"], url_path="publish-only")
    def publish_only(self, request):
        """
        Publish an event payload to Pub/Sub without persisting it.
        Useful if you want a pure streaming pipeline.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        publish_traffic_event(serializer.validated_data)
        return Response(
            {"detail": "Event published to Pub/Sub."},
            status=status.HTTP_202_ACCEPTED,
        )
