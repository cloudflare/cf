/** @generated from device-dex-test-update-device-dex-test */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/devices/dex_tests/${request.dex_test_id}`,
	body: "json",
} as const;
