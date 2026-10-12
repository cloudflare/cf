/** @generated from stream-videos-update-video-details */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}`,
	body: "json",
} as const;
