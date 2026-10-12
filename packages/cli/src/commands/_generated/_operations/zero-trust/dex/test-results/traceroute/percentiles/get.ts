/** @generated from dex-endpoints-traceroute-test-percentiles */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/traceroute-tests/${request.test_id}/percentiles`,
	query: ["deviceId", "from", "to", "colo"],
} as const;
