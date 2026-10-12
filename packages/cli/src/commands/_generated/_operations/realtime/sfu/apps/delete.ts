/** @generated from calls-apps-delete-app */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/calls/apps/${request.app_id}`,
} as const;
