/** @generated from stream-webhook-create-webhooks */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/webhook`,
	body: "json",
} as const;
