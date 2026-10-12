/** @generated from realtime.sfu.apps.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/calls/apps/${request.app_id}`,
	body: "json",
} as const;
