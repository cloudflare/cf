/** @generated from realtime.kit.presets.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/presets/${request.preset_id}`,
} as const;
