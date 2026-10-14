/** @generated from resource-sharing.recipients.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/shares/${request.share_id}/recipients/${request.recipient_id}`,
} as const;
