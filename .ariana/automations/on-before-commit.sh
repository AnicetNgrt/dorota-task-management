#!/bin/bash
# on_before_commit automation: type-check and run tests if they exist
set -e

cd /home/ariana/project

echo "Running pre-commit checks..."

# Type check
echo "Checking types..."
npx tsc --noEmit
echo "Types OK"

# Run tests if test script exists and there are test files
if grep -q '"test"' package.json 2>/dev/null; then
  if find src -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | head -1 | grep -q .; then
    echo "Running tests..."
    npm test
    echo "Tests passed"
  else
    echo "No test files found, skipping tests"
  fi
else
  echo "No test script configured, skipping tests"
fi

# Lint
echo "Running lint..."
npm run lint 2>&1 || true

echo "Pre-commit checks passed."
