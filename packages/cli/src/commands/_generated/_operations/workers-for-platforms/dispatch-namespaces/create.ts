/** @generated from workers-for-platforms.dispatch-namespaces.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/dispatch/namespaces`,
	body: "json",
} as const;
