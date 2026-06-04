#!/usr/bin/env bash
#
# setup.sh — one-shot setup for the MCP servers in this repo.
#
# What it does:
#   1. Copies .mcp.json.example -> .mcp.json (never overwrites an existing one).
#   2. Builds the three Python servers (arxiv, gemini-vision, replicate-image)
#      into per-server .venv/ folders — only if python3 is available.
#   3. Builds the Node server (harvard-art-museums-mcp) — only if pnpm is available.
#   4. Reminds you to paste your API keys from the secure Google Doc.
#
# Missing a toolchain doesn't abort the run: servers that need it are skipped
# with an install suggestion, and everything else still gets set up.
#
# Usage:  bash _mcps/setup.sh    (from anywhere — paths are resolved internally)

set -u

# --- Resolve locations ------------------------------------------------------
MCPS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$MCPS_DIR/.." && pwd)"

# --- Pretty output helpers --------------------------------------------------
bold()  { printf '\033[1m%s\033[0m\n' "$1"; }
ok()    { printf '  \033[32mok\033[0m   %s\n' "$1"; }
skip()  { printf '  \033[33mskip\033[0m %s\n' "$1"; }
fail()  { printf '  \033[31mfail\033[0m %s\n' "$1"; }

# Track whether anything was skipped so we can summarize at the end.
SKIPPED_ANY=0

# --- Step 1: .mcp.json ------------------------------------------------------
bold "1. Config file (.mcp.json)"
if [ -f "$REPO_ROOT/.mcp.json" ]; then
  skip ".mcp.json already exists — leaving it untouched"
elif [ -f "$REPO_ROOT/.mcp.json.example" ]; then
  cp "$REPO_ROOT/.mcp.json.example" "$REPO_ROOT/.mcp.json"
  ok "copied .mcp.json.example -> .mcp.json"
else
  fail ".mcp.json.example not found at repo root — cannot create .mcp.json"
fi
echo

# --- Step 2: Python servers -------------------------------------------------
bold "2. Python servers (arxiv, gemini-vision, replicate-image)"
PYTHON="$(command -v python3 || true)"
if [ -z "$PYTHON" ]; then
  skip "python3 not found — skipping all three Python servers"
  echo "       Install Python 3.10+ first:"
  echo "         macOS:  brew install python   (or https://www.python.org/downloads/)"
  echo "         then re-run this script."
  SKIPPED_ANY=1
else
  ok "found $("$PYTHON" --version 2>&1)"
  for server in arxiv gemini-vision replicate-image; do
    dir="$MCPS_DIR/$server"
    [ -d "$dir" ] || { fail "$server: folder missing"; continue; }
    printf '  building %s ...\n' "$server"

    # Fresh venv (idempotent: reuse if already present).
    if [ ! -x "$dir/.venv/bin/python" ]; then
      "$PYTHON" -m venv "$dir/.venv" || { fail "$server: venv creation failed"; continue; }
    fi
    VPIP="$dir/.venv/bin/pip"
    "$VPIP" install --quiet --upgrade pip >/dev/null 2>&1

    # Install from whichever manifest the server ships.
    if [ -f "$dir/pyproject.toml" ]; then
      ( cd "$dir" && "$VPIP" install --quiet -e . ) \
        && ok "$server: installed from pyproject.toml" \
        || fail "$server: pip install -e . failed"
    elif [ -f "$dir/requirements.txt" ]; then
      "$VPIP" install --quiet -r "$dir/requirements.txt" \
        && ok "$server: installed from requirements.txt" \
        || fail "$server: pip install -r requirements.txt failed"
    else
      fail "$server: no pyproject.toml or requirements.txt found"
    fi
  done
fi
echo

# --- Step 3: Node server ----------------------------------------------------
bold "3. Node server (harvard-art-museums-mcp)"
HAM_DIR="$MCPS_DIR/harvard-art-museums-mcp"
if [ -z "$(command -v node || true)" ]; then
  skip "node not found — skipping harvard-art-museums-mcp"
  echo "       Install Node 18+ first:"
  echo "         macOS:  brew install node   (or https://nodejs.org/)"
  SKIPPED_ANY=1
elif [ -z "$(command -v pnpm || true)" ]; then
  skip "pnpm not found — skipping harvard-art-museums-mcp"
  echo "       This repo uses pnpm. Install it, then re-run:"
  echo "         corepack enable pnpm     (ships with Node 16.9+)"
  echo "         or:  npm install -g pnpm"
  SKIPPED_ANY=1
elif [ ! -d "$HAM_DIR" ]; then
  fail "harvard-art-museums-mcp: folder missing"
else
  ok "found node $(node --version) / pnpm $(pnpm --version)"
  ( cd "$HAM_DIR" && pnpm install --silent && pnpm build ) \
    && ok "harvard-art-museums-mcp: installed and built (dist/)" \
    || fail "harvard-art-museums-mcp: pnpm install/build failed"
fi
echo

# --- Step 4: API keys reminder ---------------------------------------------
bold "4. API keys"
cat <<'EOF'
  Open .mcp.json at the repo root and paste the keys from the secure
  Google Doc we sent. Replace each ${PLACEHOLDER} with the matching value:

    gemini-vision        GEMINI_API_KEY
    replicate-image      REPLICATE_API_TOKEN
    Canvas               X-Canvas-API-Token   (header)
    harvard-art-museums  HAM_API_KEY

  (arxiv needs no key. Canvas is a hosted server — no local install.)
EOF
echo

# --- Done -------------------------------------------------------------------
bold "Next steps"
echo "  - Finish pasting your keys into .mcp.json (step 4 above)."
echo "  - Restart Claude Code so it reloads .mcp.json, approve the servers,"
echo "    then run /mcp to confirm each one is connected."
if [ "$SKIPPED_ANY" -eq 1 ]; then
  echo
  echo "  Note: one or more servers were skipped (see above). Install the"
  echo "  missing toolchain and re-run 'bash _mcps/setup.sh' to finish them."
fi
