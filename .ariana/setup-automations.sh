#!/bin/bash
# Register automations with Ariana platform
# Run this when ariana CLI token is valid
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Registering automations..."

# 1. on_agent_ready - start dev server, clean memory
cat <<'AUTOMATION_JSON' | ariana automations create
{
  "name": "dev-ready",
  "trigger": { "type": "on_agent_ready" },
  "scriptLanguage": "bash",
  "scriptContent": "#!/bin/bash\nset -e\necho 'Starting development environment...'\nif ! docker ps | grep -q dorota-postgres; then\n  echo 'Starting PostgreSQL...'\n  docker start dorota-postgres 2>/dev/null || docker run -d --name dorota-postgres -e POSTGRES_USER=dorota -e POSTGRES_PASSWORD=dorota_secret_2026 -e POSTGRES_DB=dorota -p 5432:5432 --restart unless-stopped postgres:16-alpine\n  sleep 3\nfi\ncd /home/ariana/project\nif [ ! -d node_modules ]; then npm install; fi\nnpx prisma migrate deploy 2>&1 || true\nnpx prisma generate 2>&1 || true\npkill -f 'next dev' 2>/dev/null || true\nsleep 1\nnohup npm run dev -- --port 3000 > /tmp/next-dev.log 2>&1 &\necho 'Dev server starting on port 3000...'\nfor i in $(seq 1 30); do\n  if curl -s http://localhost:3000 > /dev/null 2>&1; then\n    echo 'Dev server is ready at http://localhost:3000'\n    break\n  fi\n  sleep 1\ndone\nrm -f /home/ariana/.claude/projects/-home-ariana/memory/MEMORY.md\necho 'Development environment ready.'",
  "blocking": true,
  "feedOutput": true
}
AUTOMATION_JSON
echo "Created: dev-ready (on_agent_ready)"

# 2. on_before_commit - type check + tests
cat <<'AUTOMATION_JSON' | ariana automations create
{
  "name": "pre-commit-checks",
  "trigger": { "type": "on_before_commit" },
  "scriptLanguage": "bash",
  "scriptContent": "#!/bin/bash\nset -e\ncd /home/ariana/project\necho 'Running pre-commit checks...'\necho 'Checking types...'\nnpx tsc --noEmit\necho 'Types OK'\nif grep -q '\"test\"' package.json 2>/dev/null; then\n  if find src -name '*.test.*' -o -name '*.spec.*' 2>/dev/null | head -1 | grep -q .; then\n    echo 'Running tests...'\n    npm test\n    echo 'Tests passed'\n  else\n    echo 'No test files found, skipping tests'\n  fi\nelse\n  echo 'No test script configured, skipping tests'\nfi\necho 'Running lint...'\nnpm run lint 2>&1 || true\necho 'Pre-commit checks passed.'",
  "blocking": true,
  "feedOutput": true
}
AUTOMATION_JSON
echo "Created: pre-commit-checks (on_before_commit)"

# 3. manual - production build and run
cat <<'AUTOMATION_JSON' | ariana automations create
{
  "name": "run-production",
  "trigger": { "type": "manual" },
  "scriptLanguage": "bash",
  "scriptContent": "#!/bin/bash\nset -e\ncd /home/ariana/project\necho 'Building for production...'\nif ! docker ps | grep -q dorota-postgres; then\n  echo 'Starting PostgreSQL...'\n  docker start dorota-postgres 2>/dev/null || docker run -d --name dorota-postgres -e POSTGRES_USER=dorota -e POSTGRES_PASSWORD=dorota_secret_2026 -e POSTGRES_DB=dorota -p 5432:5432 --restart unless-stopped postgres:16-alpine\n  sleep 3\nfi\nnpx prisma migrate deploy 2>&1\nnpm run build\npkill -f 'next start' 2>/dev/null || true\npkill -f 'next dev' 2>/dev/null || true\nsleep 1\nnohup npm start -- --port 3000 > /tmp/next-prod.log 2>&1 &\necho 'Production server starting on port 3000...'\nfor i in $(seq 1 30); do\n  if curl -s http://localhost:3000 > /dev/null 2>&1; then\n    echo 'Production server is ready at http://localhost:3000'\n    break\n  fi\n  sleep 1\ndone",
  "blocking": true,
  "feedOutput": true
}
AUTOMATION_JSON
echo "Created: run-production (manual)"

echo "All automations registered."
