/** @generated from realtime.kit.recordings.start */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/realtime/kit/${request.app_id}/recordings`,
	body: "json",
} as const;
