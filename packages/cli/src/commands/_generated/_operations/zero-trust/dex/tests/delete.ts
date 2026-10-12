/** @generated from zero-trust.dex.tests.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/devices/dex_tests/${request.dex_test_id}`,
} as const;
