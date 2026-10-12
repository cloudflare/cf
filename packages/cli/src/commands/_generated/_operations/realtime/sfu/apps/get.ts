/** @generated from calls-apps-retrieve-app-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/calls/apps/${request.app_id}`,
} as const;
