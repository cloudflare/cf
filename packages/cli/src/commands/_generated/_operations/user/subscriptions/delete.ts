/** @generated from user-subscription-delete-user-subscription */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/user/subscriptions/${request.identifier}`,
} as const;
