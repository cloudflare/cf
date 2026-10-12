/** @generated from dex-endpoints-http-test-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/http-tests/${request.test_id}`,
	query: ["deviceId", "from", "to", "interval", "colo"],
} as const;
