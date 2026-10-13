import { formatOutput } from "../../lib/output.js";
import { getDefaultHeaders } from "../../lib/request-headers.js";
import { runWithTelemetry } from "../../lib/telemetry/run.js";
import type { CommandModule } from "yargs";

const DOCS_ORIGIN = "https://developers.cloudflare.com";
const SEARCH_URL =
	"https://ai-search.developers.cloudflare.com/api/ai-search/search";
const MAX_RESULTS = 5;
const SEARCH_TIMEOUT_MS = 30_000;

interface SearchChunk {
	item: {
		key: string;
		metadata?: { title?: string; description?: string };
	};
}

type SearchResponse =
	| { success: true; result: { chunks: SearchChunk[] } }
	| { success: false; error?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSearchResponse(value: unknown): value is SearchResponse {
	if (!isRecord(value)) {
		return false;
	}
	if (value.success === false) {
		return value.error === undefined || typeof value.error === "string";
	}
	return (
		value.success === true &&
		isRecord(value.result) &&
		Array.isArray(value.result.chunks) &&
		value.result.chunks.every((chunk: unknown) => {
			if (
				!isRecord(chunk) ||
				!isRecord(chunk.item) ||
				typeof chunk.item.key !== "string" ||
				chunk.item.key.length === 0
			) {
				return false;
			}
			const metadata = chunk.item.metadata;
			return (
				metadata === undefined ||
				(isRecord(metadata) &&
					(metadata.title === undefined ||
						typeof metadata.title === "string") &&
					(metadata.description === undefined ||
						typeof metadata.description === "string"))
			);
		})
	);
}

interface SearchArgs {
	query: string;
}

interface DocsSearchResult {
	title: string;
	description: string;
	url: string;
}

function docsUrl(key: string): string {
	let url: URL;
	try {
		url = new URL(key, `${DOCS_ORIGIN}/`);
	} catch {
		throw new Error("Cloudflare docs search returned an invalid URL.");
	}
	if (url.origin !== DOCS_ORIGIN || url.username || url.password) {
		throw new Error("Cloudflare docs search returned an invalid URL.");
	}
	return url.href;
}

async function searchDocumentation(query: string): Promise<DocsSearchResult[]> {
	const signal = AbortSignal.timeout(SEARCH_TIMEOUT_MS);
	let response: Response;
	try {
		response = await fetch(SEARCH_URL, {
			method: "POST",
			headers: {
				...getDefaultHeaders(),
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify({
				messages: [{ role: "user", content: query }],
				stream: false,
				ai_search_options: {
					retrieval: { metadata_only: true, max_num_results: MAX_RESULTS },
				},
			}),
			signal,
		});
	} catch (cause) {
		throw new Error(
			signal.aborted
				? "Cloudflare docs search timed out. Try again."
				: "Unable to reach Cloudflare docs search. Check your connection and try again.",
			{ cause }
		);
	}
	if (!response.ok) {
		throw new Error(`Cloudflare docs search failed (HTTP ${response.status}).`);
	}

	let data: unknown;
	try {
		data = await response.json();
	} catch (cause) {
		throw new Error(
			signal.aborted
				? "Cloudflare docs search timed out. Try again."
				: "Cloudflare docs search returned an invalid JSON response.",
			{ cause }
		);
	}
	if (!isSearchResponse(data)) {
		throw new Error("Cloudflare docs search returned an invalid response.");
	}
	if (!data.success) {
		throw new Error(
			`Cloudflare docs search failed: ${data.error ?? "Unknown error"}`
		);
	}
	return data.result.chunks.slice(0, MAX_RESULTS).map(({ item }) => ({
		title: item.metadata?.title ?? "Untitled",
		description: item.metadata?.description ?? "",
		url: docsUrl(item.key),
	}));
}

const search: CommandModule<object, SearchArgs> & { describe: string } = {
	command: "search <query>",
	describe:
		"Search live Cloudflare documentation, guides, tutorials, and examples",
	builder: (yargs) =>
		yargs
			.positional("query", {
				describe: "Search terms or a question about Cloudflare",
				type: "string",
				demandOption: true,
				coerce: (query: string) => {
					const trimmed = query.trim();
					if (!trimmed) {
						throw new Error("query must not be empty.");
					}
					return trimmed;
				},
			})
			.example('cf docs search "schedule a worker"', "Find guides and examples")
			.epilogue(
				"Returns up to five ranked JSON results with title, description, and url. No Cloudflare login is required.\nFetch a result's URL with Accept: text/markdown to read the full page as Markdown."
			),
	handler: (argv) =>
		runWithTelemetry(
			{ command: "docs search", recordArgs: false, searchQuery: argv.query },
			argv as Record<string, unknown>,
			async () => {
				formatOutput(await searchDocumentation(argv.query));
			}
		),
};

export default search;
