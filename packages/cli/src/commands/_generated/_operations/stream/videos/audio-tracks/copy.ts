/** @generated from stream.videos.audio-tracks.copy */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/audio/copy`,
	body: "json",
} as const;
