import { CloudflareApiError } from "#sdk/errors";
import { APIError as WorkersUtilsAPIError } from "@cloudflare/workers-utils";
import { VERSION } from "../version.js";
import { openSession } from "./session.js";
import { errorBlock } from "./ui/blocks.js";
import { hint } from "./ui/format.js";
import { theme } from "./ui/theme.js";
import { CloudflareApiError } from "#sdk";

/**
 * Drop the protocol+host (and the `/client/v4` API-version prefix)
 * from a Cloudflare API URL so the path-only form fits inside the
 * error box without wrapping.  cf always talks to one of a small set
 * of hosts (api.cloudflare.com/client/v4 by default; other
 * compliance-region variants under api.fed.cloudflare.com etc.) and
 * always against the v4 surface — preserving these on every error
 * line wastes box width without adding diagnostic value.  Falls back
 * to the original string if it isn't a parseable URL.
 */
function shortenUrl(url: string): string {
	try {
		const u = new URL(url);
		const path = u.pathname.replace(/^\/client\/v\d+/, "");
		return `${path}${u.search}`;
	} catch {
		return url;
	}
}

/**
 * Render an error to stderr and return the value the caller should
 * throw.
 *
 * Called once, centrally, from `main()`
 * after `cli.parse()` rejects.  There is no per-handler invocation —
 * generated and hand-written command handlers let SDK errors
 * propagate uncaught; yargs `.fail()` rethrows validation errors;
 * everything funnels here.
 *
 * - Cloudflare `APIError`s render as a boxed report with the failing
 *   request's HTTP method + path (read off `error.request`, populated
 *   by the forge SDK on every thrown `APIError`).
 * - Plain `Error`s render with their message (and stack under `DEBUG=1`).
 * - Unknown error shapes get a generic box.
 *
 * The return value is the error to rethrow.  Today this is the input
 * unchanged so tests can catch it on the `runMain` rejection and
 * assert against the original shape (status, code, message); future
 * versions may normalise (wrap in a `CfError`, attach a `cause`,
 * collapse non-`Error` shapes) without `main()` needing to change.
 * `bin/cf` and `dev.ts` translate the rethrow into `process.exit(1)`
 * without writing to stderr.
 */
export function handleError(error: unknown): unknown {
	// Anchor the error in cf's visual language. Normally `main()`
	// already opened the session above the command's output, but
	// errors that short-circuit before `main()`'s session site (e.g.
	// yargs validation errors during `buildCli()` setup) still want
	// the visual anchor. `openSession` is idempotent, so calling it
	// here is safe in all cases. `errorBlock` itself degrades
	// gracefully to ASCII `+ | +` frames in non-color environments —
	// chalk's no-op proxy strips the styling — so there's no need to
	// branch on color support at the call sites below.
	openSession(VERSION);

	// Typed Fern calls and cf's passthrough/raw paths share this SDK error type.
	if (error instanceof CloudflareApiError) {
		const status = error.statusCode;
		const errorBody = error.body;
		const statusText =
			status === undefined ? "Envelope Error" : getStatusText(status);

		// Extract per-error {code, message} entries from the raw API
		// response envelope: {success:false, errors:[{code, message}, ...]}
		type ApiErr = { code?: number; message?: string };
		let apiErrs: ApiErr[] = [];
		if (errorBody) {
			const data = errorBody as Record<string, unknown>;
			if (Array.isArray(data.errors)) {
				apiErrs = data.errors as ApiErr[];
			}
		}

		// Path-only form keeps the box narrow; cf only talks to a
		// fixed set of Cloudflare API hosts so the host adds no info.
		// `error.rawResponse` is populated by the SDK on thrown errors;
		// absent only for hand-constructed errors (tests, retry shims).
		// The raw response carries no HTTP method, so the line is
		// prefixed with a generic `HTTP` rather than the verb.
		const reqLine = error.rawResponse?.url
			? `HTTP ${shortenUrl(error.rawResponse.url)}`
			: undefined;

		// Combined status + request line: "400 Bad Request · HTTP /path".
		// Single dim line keeps the box compact while preserving both
		// pieces of diagnostic info. Envelope errors have no status.
		const statusBlurb =
			status === undefined ? statusText : `${status} ${statusText}`;
		const tailLine = reqLine ? `${statusBlurb} · ${reqLine}` : statusBlurb;

		// Render each API error as:
		//   [CODE]  message                              ← bold + error color
		//           HTTP 404 Not Found · HTTP /path      ← dim, subordinated
		// When colors are off, chalk's no-op proxy strips the styling
		// and `errorBlock` swaps in ASCII frame glyphs — same content,
		// just plainer.
		const tail = theme.muted(tailLine);
		let content = "";
		if (apiErrs.length > 0) {
			content = apiErrs
				.map((err, idx) => {
					const code =
						typeof err.code === "number"
							? theme.error(theme.bold(`[${err.code}]`))
							: theme.error(theme.bold("[error]"));
					const msg = theme.bold(err.message ?? "");
					// Show the tail once, after the last error entry.
					return idx === apiErrs.length - 1
						? `${code} ${msg}\n${tail}`
						: `${code} ${msg}`;
				})
				.join("\n\n");
		} else {
			// No structured errors — surface the SDK's own message, falling
			// back to the tail line, then subordinate the tail beneath it.
			content = theme.error(theme.bold(error.message || tailLine));
			if (error.message && tailLine) {
				content += `\n${tail}`;
			}
		}
		console.error(
			errorBlock(content, undefined, {
				title: "APIError",
				rawMessage: true,
			})
		);

		// Add helpful hints for common errors
		if (status === 401) {
			console.error("\n" + hint("Try running: cf auth login"));
		} else if (status === 403) {
			console.error("\n" + hint("Check your API token permissions"));
		}

		return error;
	}

	// Handle Cloudflare API errors thrown by the deploy path. These come
	// from @cloudflare/workers-utils (a *different* APIError class than the
	// forge SDK's), so they don't match the branch above. The real API
	// error messages live in `.notes` ({text}[]) — the top-level `.message`
	// is only the generic "A request to the Cloudflare API (…) failed."
	// envelope. Surfacing the notes is what turns an opaque deploy failure
	// into an actionable one.
	if (error instanceof WorkersUtilsAPIError) {
		const tailLine =
			error.status !== undefined
				? `${error.status} ${getStatusText(error.status)}`.trim()
				: "";
		const tail = tailLine ? theme.muted(tailLine) : "";

		const notes = error.notes ?? [];
		let content: string;
		if (notes.length > 0) {
			const codeLabel =
				typeof error.code === "number"
					? theme.error(theme.bold(`[${error.code}]`))
					: theme.error(theme.bold("[error]"));
			content = notes
				.map((note, idx) => {
					const msg = theme.bold(note.text);
					const line = idx === 0 ? `${codeLabel} ${msg}` : msg;
					return idx === notes.length - 1 && tail ? `${line}\n${tail}` : line;
				})
				.join("\n\n");
		} else {
			// No structured notes — fall back to the generic message + status.
			const msg = theme.error(theme.bold(error.message));
			content = tail ? `${msg}\n${tail}` : msg;
		}

		console.error(
			errorBlock(content, undefined, {
				title: "APIError",
				rawMessage: true,
			})
		);

		if (error.status === 401) {
			console.error("\n" + hint("Try running: cf auth login"));
		} else if (error.status === 403) {
			console.error("\n" + hint("Check your API token permissions"));
		}

		return error;
	}

	// Handle standard Error objects
	if (error instanceof Error) {
		const details =
			process.env.DEBUG && error.stack ? sanitize(error.stack) : undefined;
		console.error(errorBlock(error.message, details));
		return error;
	}

	// Handle unknown error types
	console.error(errorBlock("An unexpected error occurred", String(error)));
	return error;
}

/**
 * Sanitize potential tokens from error output.
 * Redacts anything that looks like a token (40+ char alphanumeric strings).
 */
function sanitize(text: string): string {
	return text.replace(/[A-Za-z0-9_-]{40,}/g, "[REDACTED]");
}

/**
 * Get a human-readable status text for HTTP status codes.
 */
function getStatusText(status: number): string {
	const statusTexts: Record<number, string> = {
		400: "Bad Request",
		401: "Unauthorized",
		403: "Forbidden",
		404: "Not Found",
		405: "Method Not Allowed",
		409: "Conflict",
		422: "Unprocessable Entity",
		429: "Too Many Requests",
		500: "Internal Server Error",
		502: "Bad Gateway",
		503: "Service Unavailable",
		504: "Gateway Timeout",
	};

	return statusTexts[status] ?? "";
}
