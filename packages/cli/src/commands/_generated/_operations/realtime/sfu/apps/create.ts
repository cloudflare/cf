/** @generated from realtime.sfu.apps.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/calls/apps`,
	body: "json",
} as const;
