/** @generated from delete-presets-preset_id */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/presets/${request.preset_id}`,
} as const;
