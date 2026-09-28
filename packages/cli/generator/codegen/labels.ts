/**
 * Progress + success label strings for generated commands.
 *
 * Driven by HTTP verb + cf method name. Output is consumed by the
 * handler emitter for the spinner label and `formatOutput`'s
 * `successLabel`.
 *
 * Labels are verb-only ("Creating", "Deleting", "Loading"): the command
 * the user just typed already names the resource, so the spinner doesn't
 * repeat it. This keeps labels free of English-pluralisation heuristics.
 */

/**
 * Method names that are read-shaped despite their HTTP verb. POST
 * endpoints like D1's `query`/`raw`, KV's `bulk-get`, search endpoints,
 * signed-URL `export` poll, etc.: HTTP method says POST → default label
 * would be "Creating", which is misleading. These names trump back to
 * read semantics.
 */
const READ_SHAPED_NAMES = new Set([
	"query",
	"raw",
	"read",
	"search",
	"bulk-get",
	"export",
	"preview",
]);

const VERB_MAP: Record<string, { progress: string; success: string }> = {
	POST: { progress: "Creating", success: "Created" },
	PUT: { progress: "Updating", success: "Updated" },
	PATCH: { progress: "Updating", success: "Updated" },
	DELETE: { progress: "Deleting", success: "Deleted" },
	GET: { progress: "Loading", success: "Loaded" },
	HEAD: { progress: "Loading", success: "Loaded" },
};

/**
 * Build verb-only progress + success labels for an API command.
 *
 *   POST   create → "Creating" / "Created"
 *   PUT    update → "Updating" / "Updated"
 *   DELETE delete → "Deleting" / "Deleted"
 *   GET    list   → "Loading"  / "Loaded"
 *
 * Verb comes from the HTTP method, except read-shaped POSTs (query,
 * search, …) which label as reads.
 */
export function buildLabels(
	httpMethod: string,
	methodName: string
): { progress: string; success: string } {
	if (READ_SHAPED_NAMES.has(methodName)) {
		return { progress: "Loading", success: "Loaded" };
	}
	const method = httpMethod.toUpperCase();
	return VERB_MAP[method] ?? { progress: "Processing", success: "Done" };
}
