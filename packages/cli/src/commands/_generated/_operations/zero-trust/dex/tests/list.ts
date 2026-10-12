/** @generated from zero-trust.dex.tests.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/devices/dex_tests`,
	query: ["page", "per_page", "testName", "kind"],
} as const;
