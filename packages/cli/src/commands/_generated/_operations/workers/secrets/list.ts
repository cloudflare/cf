/** @generated from worker-list-script-secrets */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/scripts/${request.script_name}/secrets`,
} as const;
