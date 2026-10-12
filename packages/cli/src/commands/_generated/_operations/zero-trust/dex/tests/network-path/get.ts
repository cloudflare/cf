/** @generated from dex-endpoints-traceroute-test-network-path */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/traceroute-tests/${request.test_id}/network-path`,
	query: ["deviceId", "from", "to", "interval"],
} as const;
