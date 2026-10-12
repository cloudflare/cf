/** @generated from worker-delete-script-secret */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/scripts/${request.script_name}/secrets/${request.secret_name}`,
	query: ["url_encoded"],
} as const;
