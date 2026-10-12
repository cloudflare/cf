/** @generated from namespace-worker-get-script-secrets */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/dispatch/namespaces/${request.dispatch_namespace}/scripts/${request.script_name}/secrets/${request.secret_name}`,
	query: ["url_encoded"],
} as const;
