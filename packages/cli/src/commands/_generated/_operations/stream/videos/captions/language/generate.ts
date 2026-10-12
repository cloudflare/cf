/** @generated from stream-subtitles/-captions-generate-caption-or-subtitle-for-language */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/captions/${request.language}/generate`,
} as const;
