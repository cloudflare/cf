/** @generated from device-dex-test-create-device-dex-test */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/devices/dex_tests`,
	body: "json",
} as const;
