#!/bin/bash
# on_agent_ready automation: start dev server and ensure clean state
set -e

echo "Starting development environment..."

# Ensure postgres container is running
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

cd /home/ariana/project

# Install deps if needed
if [ ! -d node_modules ]; then
  npm install
fi

# Run migrations
npx prisma migrate deploy 2>&1 || true

# Generate prisma client
npx prisma generate 2>&1 || true

# Kill any existing dev server
pkill -f "next dev" 2>/dev/null || true
sleep 1

# Start dev server in background
nohup npm run dev -- --port 3000 > /tmp/next-dev.log 2>&1 &
echo "Dev server starting on port 3000..."

# Wait for it to be ready
for i in $(seq 1 30); do
  if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "Dev server is ready at http://localhost:3000"
    break
  fi
  sleep 1
done

# Clean memory files for fresh agent
rm -f /home/ariana/.claude/projects/-home-ariana/memory/MEMORY.md

echo "Development environment ready."
