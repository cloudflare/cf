/** @generated from realtime.kit.apps.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/apps`,
	body: "json",
} as const;
