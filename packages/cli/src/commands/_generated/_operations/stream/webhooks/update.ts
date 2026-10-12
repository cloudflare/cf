/** @generated from stream.webhooks.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/webhook`,
	body: "json",
} as const;
