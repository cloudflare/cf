/** @generated from worker-put-script-secret */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/scripts/${request.script_name}/secrets`,
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
