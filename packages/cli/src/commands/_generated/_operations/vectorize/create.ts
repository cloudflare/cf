/** @generated from vectorize.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/vectorize/v2/indexes`,
	body: "json",
} as const;
