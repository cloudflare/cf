/** @generated from zero-trust.dex.overview.tests.unique-devices.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/tests/unique-devices`,
	query: ["testName", "deviceId"],
} as const;
