FROM python:3.11-slim

WORKDIR /app

# System deps (minimal). Add build deps only if needed.
RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend source
COPY backend/ /app

EXPOSE 5000

# Ensure Flask can find the module
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# Dev server (hot reload via mounted volumes; Flask reload is handled by the default dev server)
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]

