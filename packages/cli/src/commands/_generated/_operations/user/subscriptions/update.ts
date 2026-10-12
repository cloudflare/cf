/** @generated from user-subscription-update-user-subscription */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/user/subscriptions/${request.identifier}`,
	body: "json",
} as const;
