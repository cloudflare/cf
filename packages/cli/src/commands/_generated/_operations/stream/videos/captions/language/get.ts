/** @generated from stream-subtitles/-captions-get-caption-or-subtitle-for-language */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/captions/${request.language}`,
} as const;
