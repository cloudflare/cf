/** @generated from queues.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/queues`,
	query: ["page", "per_page"],
} as const;
