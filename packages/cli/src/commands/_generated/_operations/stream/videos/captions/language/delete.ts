/** @generated from stream-subtitles/-captions-delete-captions-or-subtitles */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/captions/${request.language}`,
} as const;
