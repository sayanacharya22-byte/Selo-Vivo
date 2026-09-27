#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE="$ROOT_DIR/contract/src/selo-vivo.compact"
OUTPUT="$ROOT_DIR/contract/managed/selo-vivo"

compact compile "$SOURCE" "$OUTPUT"
node "$ROOT_DIR/scripts/sync-zk-assets.mjs"
