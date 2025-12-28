# Gunakan image Python
FROM python:3.10

# Set workdir ke /app
WORKDIR /app

# Copy semua file ke container
COPY . .

# Install dependencies backend
RUN pip install --upgrade pip && pip install -r backend/requirements.txt

# Expose port
EXPOSE 8000

# Start backend
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
