#!/usr/bin/env bash
# Fetch an IETF document source, XML-first with HTML/TXT fallback.
# Usage: fetch-source.sh <RFC-number | draft-name>   (exactly one document)
# Prints the document body to stdout; non-zero exit on failure.
set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "usage: $0 <RFC-number | draft-name>  (exactly one document)" >&2
  exit 2
fi

arg="$1"
urls=()

if printf '%s' "$arg" | grep -qiE '^(rfc[[:space:]]*)?[0-9]+$'; then
  # RFC: "RFC6625", "rfc 6625", or bare "6625"
  num="$(printf '%s' "$arg" | grep -oE '[0-9]+')"
  base="https://www.rfc-editor.org/rfc/rfc${num}"
  urls=("${base}.xml" "${base}.html" "${base}.txt")
else
  # Internet-Draft: resolve latest revision via datatracker, fetch from archive.
  name="${arg%.txt}"; name="${name%.xml}"
  rev="$(curl -fsSL "https://datatracker.ietf.org/api/v1/doc/document/${name}/?format=json" \
        | grep -oE '"rev"[[:space:]]*:[[:space:]]*"[0-9]+"' | head -1 | grep -oE '[0-9]+' || true)"
  if [ -z "${rev}" ]; then
    echo "could not resolve latest revision for draft '${name}' via datatracker" >&2
    exit 3
  fi
  base="https://www.ietf.org/archive/id/${name}-${rev}"
  urls=("${base}.xml" "${base}.html" "${base}.txt")
fi

for u in "${urls[@]}"; do
  if curl -fsSL "$u"; then
    exit 0
  fi
done

echo "failed to fetch any source format for '${arg}'" >&2
exit 1
