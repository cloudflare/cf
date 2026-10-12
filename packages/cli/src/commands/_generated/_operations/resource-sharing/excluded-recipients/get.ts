/** @generated from resource-sharing.excluded-recipients.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/shares/${request.share_id}/excluded-recipients/${request.excluded_recipient_id}`,
} as const;
