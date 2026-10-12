/** @generated from accounts.subscriptions.get-by-identifier */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/subscriptions/${request.subscription_identifier}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
