/** @generated from resource-sharing.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/shares/${request.share_id}`,
	query: ["include_resources", "include_recipient_counts"],
} as const;
