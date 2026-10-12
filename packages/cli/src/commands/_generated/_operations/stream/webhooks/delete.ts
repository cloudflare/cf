/** @generated from stream-webhook-delete-webhooks */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/webhook`,
} as const;
