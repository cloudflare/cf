/** @generated from zero-trust.dex.test-results.traceroute.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/traceroute-tests/${request.test_id}`,
	query: ["deviceId", "from", "to", "interval", "colo"],
} as const;
