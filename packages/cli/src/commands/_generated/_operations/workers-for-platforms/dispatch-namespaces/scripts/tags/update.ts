/** @generated from workers-for-platforms.dispatch-namespaces.scripts.tags.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/dispatch/namespaces/${request.dispatch_namespace}/scripts/${request.script_name}/tags`,
	body: "json",
} as const;
