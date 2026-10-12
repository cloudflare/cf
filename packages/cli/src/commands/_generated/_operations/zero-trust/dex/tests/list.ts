/** @generated from device-dex-test-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/devices/dex_tests`,
	query: ["page", "per_page", "testName", "kind"],
} as const;
