/** @generated from edit-audio-tracks */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/audio/${request.audio_identifier}`,
	body: "json",
} as const;
