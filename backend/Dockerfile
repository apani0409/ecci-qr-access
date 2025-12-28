# Dockerfile para Backend
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar aplicación
COPY . .

# Ejecutar migraciones y aplicación
CMD ["sh", "-c", "alembic upgrade head && python init_db.py || true && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
