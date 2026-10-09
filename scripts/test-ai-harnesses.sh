#!/usr/bin/env bash
set -euo pipefail

prompt="${1:-Why are dogs so great?}"
endpoint="${CF_AI_ENDPOINT:-https://ai.charliegleason.com}"
account_id="${CLOUDFLARE_ACCOUNT_ID:-${CLOUDFLARE_PRODUCTION_ACCOUNT_ID_CHARLIE_GLEASON:-}}"
cf_bin="${CF_BIN:-xcf}"

if ! command -v "$cf_bin" >/dev/null 2>&1; then
	printf 'Error: %s is not available on PATH. Run this script from the cf repository.\n' "$cf_bin" >&2
	exit 1
fi

print_command() {
	printf '+ '
	local arg
	for arg in "$@"; do
		if [[ "$arg" =~ [[:space:]] ]]; then
			printf '"%s" ' "${arg//\"/\\\"}"
		else
			printf '%s ' "$arg"
		fi
	done
	printf '\n'
}

run() {
	print_command "$@"
	"$@"
}

printf '\n=== OpenCode ===\n'
run "$cf_bin" ai opencode --endpoint "$endpoint" run "$prompt"

printf '\n=== Codex ===\n'
run "$cf_bin" ai codex --endpoint "$endpoint" exec --skip-git-repo-check "$prompt"

printf '\n=== Claude Code ===\n'
run "$cf_bin" ai claude --endpoint "$endpoint" -p "$prompt"

if [[ -z "$account_id" ]]; then
	printf '\nError: set CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_PRODUCTION_ACCOUNT_ID_CHARLIE_GLEASON before testing Pi.\n' >&2
	exit 1
fi

printf '\n=== Pi ===\n'
printf '+ CLOUDFLARE_ACCOUNT_ID=%s ' "$account_id"
for arg in "$cf_bin" ai pi --print "$prompt"; do
	if [[ "$arg" =~ [[:space:]] ]]; then
		printf '"%s" ' "${arg//\"/\\\"}"
	else
		printf '%s ' "$arg"
	fi
done
printf '\n'
CLOUDFLARE_ACCOUNT_ID="$account_id" "$cf_bin" ai pi --print "$prompt"
