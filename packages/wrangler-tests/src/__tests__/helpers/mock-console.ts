import { mockConsoleMethods as mockConsoleMethodsCommon } from "@cloudflare/workers-utils/test-helpers";

/**
 * Mock out the console methods and return an object to access their outputs.
 *
 * The wrangler version of this helper additionally pinned `logger.columns`
 * to 100 for stable wrap-width in snapshots; cf has no equivalent logger
 * with a `columns` setting, so that's dropped. Wrap-width differences will
 * surface as snapshot diffs we update in place.
 */
export function mockConsoleMethods(): {
	debug: string;
	out: string;
	info: string;
	err: string;
	warn: string;
	getAndClearOut: () => "";
} {
	return mockConsoleMethodsCommon();
}
