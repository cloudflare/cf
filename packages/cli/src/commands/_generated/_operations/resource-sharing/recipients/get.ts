/** @generated from resource-sharing.recipients.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/shares/${request.share_id}/recipients/${request.recipient_id}`,
	query: ["include_resources"],
} as const;
