/** @generated from workers-for-platforms.dispatch-namespaces.scripts.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/dispatch/namespaces/${request.dispatch_namespace}/scripts`,
	query: ["tags"],
} as const;
