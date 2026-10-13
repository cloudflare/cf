/** @generated from workers-for-platforms.dispatch-namespaces.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/dispatch/namespaces/${request.dispatch_namespace}`,
} as const;
