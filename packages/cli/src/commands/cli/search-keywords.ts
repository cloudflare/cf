/**
 * Extra `cf cli search` keywords for generated commands, keyed by command.
 *
 * Generated commands have no sidecar to carry `search.keywords`, so their
 * keywords live here and are merged with any sidecar keywords when the search
 * index is built. Hand-written commands set keywords in their `meta.ts`.
 *
 * Add only words that the command's path does not already contain: the
 * words agents use for the task, such as Wrangler's verbs ("put" for
 * `wrangler secret put`). A word repeated from the path, which has the highest
 * boost, adds weight to that word alone, and the command starts winning
 * unrelated searches. Tests enforce this and pin the queries each entry is for.
 */
export const searchKeywords: Readonly<Record<string, readonly string[]>> = {
	"cf accounts list": ["account"],
	// "add" also outranks `d1 migrations apply`, whose summary matches the
	// query word "a" by prefix ("create a D1 database").
	"cf d1 create": ["add"],
	// Already in the summary, but `d1 insights databases` has it in its path.
	"cf d1 list": ["databases"],
	// Workers Logs. Its path and descriptions only say "o11y" and "telemetry".
	"cf o11y telemetry query": ["workers", "worker", "logs", "observability"],
	// Worker-level settings. Bindings are per version.
	"cf workers get": ["script", "settings", "worker"],
	// Lists every script when given no filters. "listing" matches the query
	// word "list" by prefix only; an exact "list" made it outrank
	// `client-side-security scripts list` for "list scripts".
	"cf workers scripts search": ["listing"],
	"cf workers secrets bulk": ["wrangler", "upload", "dotenv", "env", "json"],
	"cf workers secrets delete": ["wrangler", "remove"],
	"cf workers secrets list": ["wrangler", "names", "show"],
	"cf workers secrets update": [
		"put",
		"set",
		"create",
		"wrangler",
		"environment variable",
		"env var",
	],
	"cf workers versions get": ["script", "settings", "bindings"],
	"cf zero-trust organization get": ["organizations", "org"],
};
