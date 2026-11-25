/** @generated from user.subscriptions.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/subscriptions/${request.identifier}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
