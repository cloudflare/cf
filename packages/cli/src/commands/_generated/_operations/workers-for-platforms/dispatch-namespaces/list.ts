/** @generated from workers-for-platforms.dispatch-namespaces.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/dispatch/namespaces`,
} as const;
