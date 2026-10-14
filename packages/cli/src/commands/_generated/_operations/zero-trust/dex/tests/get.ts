/** @generated from zero-trust.dex.tests.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/devices/dex_tests/${request.dex_test_id}`,
} as const;
