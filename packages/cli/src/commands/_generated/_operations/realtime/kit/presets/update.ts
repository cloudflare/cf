/** @generated from realtime.kit.presets.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/presets/${request.preset_id}`,
	body: "json",
} as const;
