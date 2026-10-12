/** @generated from pipelines.legacy-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines`,
	query: ["search", "page", "per_page"],
} as const;
