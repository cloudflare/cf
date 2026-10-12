/** @generated from workers.secrets.bulk */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/scripts/${request.script_name}/secrets-bulk`,
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
