/** @generated from workers-for-platforms.dispatch-namespaces.scripts.settings.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/dispatch/namespaces/${request.dispatch_namespace}/scripts/${request.script_name}/settings`,
	pathParams: ["account_id", "dispatch_namespace", "script_name"],
	body: "form",
} as const;
