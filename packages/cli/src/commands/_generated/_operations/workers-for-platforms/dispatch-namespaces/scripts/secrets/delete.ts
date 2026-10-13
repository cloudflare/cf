/** @generated from workers-for-platforms.dispatch-namespaces.scripts.secrets.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/dispatch/namespaces/${request.dispatch_namespace}/scripts/${request.script_name}/secrets/${request.secret_name}`,
	query: ["url_encoded"],
} as const;
