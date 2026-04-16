#!/usr/bin/env bash
set -euo pipefail

echo "Running all provider tests..."
npm run test -- --reporter=verbose

echo "Done."
