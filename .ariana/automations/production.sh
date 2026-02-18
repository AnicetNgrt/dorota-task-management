#!/bin/bash
# Manual automation: build and run in production mode
set -e

cd /home/ariana/project

echo "Building for production..."

# Ensure postgres is running
if ! docker ps | grep -q dorota-postgres; then
  echo "Starting PostgreSQL..."
  docker start dorota-postgres 2>/dev/null || \
    docker run -d --name dorota-postgres \
      -e POSTGRES_USER=dorota \
      -e POSTGRES_PASSWORD=dorota_secret_2026 \
      -e POSTGRES_DB=dorota \
      -p 5432:5432 \
      --restart unless-stopped \
      postgres:16-alpine
  sleep 3
fi

# Run migrations
npx prisma migrate deploy 2>&1

# Build
npm run build

# Kill any existing servers
pkill -f "next start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Start production server
nohup npm start -- --port 3000 --hostname 0.0.0.0 > /tmp/next-prod.log 2>&1 &
echo "Production server starting on port 3000..."

# Wait for it to be ready
for i in $(seq 1 30); do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "Production server is ready at http://localhost:3000"
    break
  fi
  sleep 1
done
