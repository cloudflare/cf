/** @generated from namespace-worker-put-script-secrets */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/dispatch/namespaces/${request.dispatch_namespace}/scripts/${request.script_name}/secrets`,
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
