/** @generated from realtime.sfu.apps.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/calls/apps/${request.app_id}`,
} as const;
