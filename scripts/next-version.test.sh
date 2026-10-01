#!/usr/bin/env bash
# Exercises scripts/next-version.ts against throwaway git repos.
# Usage: scripts/next-version.test.sh scripts/next-version.ts
set -u
# The harness cds into throwaway repos, so the script path must be absolute.
SCRIPT=$(realpath "$1"); PASS=0; FAIL=0

mk() { # prints a fresh plugin-shaped repo dir; caller must cd into it
  local d; d=$(mktemp -d)
  (
    cd "$d" || exit 1
    git init -q -b main; git config user.email t@t; git config user.name t
    printf '<?php\n/**\n * Plugin Name: X\n * Version: 0.1.0\n */\n' > frontenda-blocks.php
    printf '{\n  "name": "x",\n  "version": "0.1.0"\n}\n' > package.json
    git add -A; git commit -qm "chore: init"
  ) >/dev/null 2>&1
  echo "$d"
}
c() { git commit -q --allow-empty -m "$1"; }
expect() { # expect <label> <want>
  local out got hdr pkg
  out=$(bun run "$SCRIPT" 2>&1)
  if [ -f .next-version ]; then got=$(tr -d '\n' < .next-version); else got=NONE; fi
  hdr=$(grep -oP 'Version:\s*\K.*' frontenda-blocks.php)
  pkg=$(grep -oP '"version":\s*"\K[^"]+' package.json)
  if [ "$got" != "$2" ]; then
    echo "FAIL  $1  -> got=$got want=$2"; echo "        $out" | head -3; FAIL=$((FAIL+1)); return
  fi
  if [ "$2" != NONE ] && { [ "$hdr" != "$2" ] || [ "$pkg" != "$2" ]; }; then
    echo "FAIL  $1  -> .next-version=$got but header=$hdr package=$pkg"; FAIL=$((FAIL+1)); return
  fi
  if [ "$2" = NONE ] && { [ "$hdr" != 0.1.0 ] || [ "$pkg" != 0.1.0 ]; }; then
    echo "FAIL  $1  -> no release expected yet files were rewritten (header=$hdr)"; FAIL=$((FAIL+1)); return
  fi
  echo "PASS  $1  -> $got"; PASS=$((PASS+1))
}

d=$(mk); cd "$d"; git tag v1.0.0; c "fix: a";                            expect "fix after v1.0.0" 1.0.1
d=$(mk); cd "$d"; git tag v1.0.0; c "feat: a"; c "fix: b";               expect "feat+fix -> minor" 1.1.0
d=$(mk); cd "$d"; git tag v1.2.3; c "feat!: a";                          expect "breaking !: -> major" 2.0.0
d=$(mk); cd "$d"; git tag v1.2.3; c "refactor: x

BREAKING CHANGE: y";                                                      expect "BREAKING CHANGE footer" 2.0.0
d=$(mk); cd "$d"; git tag v1.0.0; c "chore: a"; c "docs: b";             expect "chore/docs only" NONE
# A body that describes the convention must not trigger it: BREAKING CHANGE is
# a footer, so it only counts at the start of a line.
d=$(mk); cd "$d"; git tag v1.0.0; c "feat: ci

rules -- !:/BREAKING CHANGE: major, feat: minor";                         expect "breaking marker only as prose" 1.1.0
d=$(mk); cd "$d"; git tag v1.0.0; c "feat: x

BREAKING-CHANGE: y";                                                      expect "BREAKING-CHANGE hyphen footer" 2.0.0
d=$(mk); cd "$d"; git tag v1.0.0; c "feat: tw"; c 'Revert "feat: tw"';   expect "feat then revert" NONE
d=$(mk); cd "$d"; git tag v1.0.0; c "feat: a"; c "feat: b"; c 'Revert "feat: b"'; expect "revert one of two feats" 1.1.0
d=$(mk); cd "$d"; c "fix: a";                                            expect "no tag -> from 0.0.0" 0.0.1
d=$(mk); cd "$d"; git tag v1.0.0; c "fix: a"; bun run "$SCRIPT" >/dev/null 2>&1; expect "rerun is idempotent" 1.0.1

echo; echo "passed=$PASS failed=$FAIL"; [ "$FAIL" -eq 0 ]
