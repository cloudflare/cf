/** @generated from zero-trust.dex.tests.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/devices/dex_tests`,
	body: "json",
} as const;
