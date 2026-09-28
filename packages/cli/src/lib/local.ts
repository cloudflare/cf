/** Dependency-free request plumbing for `--local`. */

export const NO_LOCAL_EQUIVALENT =
	"This command has no local equivalent. Re-run without --local to use the Cloudflare API.";

let disposeRuntime: (() => Promise<void>) | undefined;

/** Dispose Miniflare if a local fetch started it. Free on non-local paths. */
export async function disposeLocalRuntime(): Promise<void> {
	const dispose = disposeRuntime;
	disposeRuntime = undefined;
	await dispose?.();
}

/** Build a fetch wrapper that starts Miniflare on first dispatch. */
export function createLocalFetch(
	options: { persistTo?: string; apiBaseUrl?: string } = {}
): typeof globalThis.fetch {
	return async function localFetch(input, init) {
		const { dispatchLocal, disposeLocalSession } =
			await import("./local-runtime.js");
		disposeRuntime = disposeLocalSession;
		return dispatchLocal(
			new Request(input, init),
			options.persistTo,
			options.apiBaseUrl
		);
	};
}

/** SDK account placeholder stripped before local dispatch. */
export const LOCAL_ACCOUNT_ID = "local";
