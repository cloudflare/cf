/** @generated from pause_resume_stop_recording */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/recordings/${request.recording_id}`,
	body: "json",
} as const;
