# Use a slim Python image
FROM python:3.13-slim AS base

# Avoid Python bytecode and ensure stdout/stderr are unbuffered
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system deps (for psycopg / Postgres, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project code
COPY . .

# Expose Django/Gunicorn port
EXPOSE 8000

# Environment defaults (override via Cloud Run / env vars)
ENV DJANGO_DEBUG=false \
    DJANGO_ALLOWED_HOSTS=* \
    DB_HOST=localhost \
    DB_PORT=5432

# Run DB migrations then start Gunicorn
CMD ["sh", "-c", "python manage.py migrate && gunicorn traffic_backend.wsgi:application --bind 0.0.0.0:8000 --workers 3"]