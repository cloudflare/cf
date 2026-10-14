/** @generated from realtime.kit.apps.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/apps/${request.app_id}`,
} as const;
