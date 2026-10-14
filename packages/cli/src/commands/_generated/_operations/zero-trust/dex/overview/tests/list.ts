/** @generated from zero-trust.dex.overview.tests.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/tests/overview`,
	query: [
		"colo",
		"testName",
		"deviceId",
		"registration_id",
		"page",
		"per_page",
		"kind",
	],
} as const;
