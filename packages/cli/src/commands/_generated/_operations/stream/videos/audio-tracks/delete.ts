/** @generated from delete-audio-tracks */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/audio/${request.audio_identifier}`,
} as const;
