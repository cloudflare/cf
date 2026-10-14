/** @generated from accounts.subscriptions.cancel-delayed-downgrade */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/subscriptions/cancel-downgrade`,
	body: "json",
} as const;
