/** @generated from images.stats */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/stats`,
} as const;
