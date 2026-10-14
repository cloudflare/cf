/** @generated from user.subscriptions.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/user/subscriptions/${request.identifier}`,
} as const;
