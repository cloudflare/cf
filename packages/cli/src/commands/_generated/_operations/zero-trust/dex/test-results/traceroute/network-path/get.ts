/** @generated from zero-trust.dex.test-results.traceroute.network-path.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/traceroute-test-results/${request.test_result_id}/network-path`,
} as const;
