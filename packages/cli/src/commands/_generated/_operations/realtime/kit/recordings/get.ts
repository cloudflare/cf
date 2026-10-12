/** @generated from get_one_recording */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/recordings/${request.recording_id}`,
} as const;
