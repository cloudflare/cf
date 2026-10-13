/** @generated from stream.videos.captions.language.vtt.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/captions/${request.language}/vtt`,
	response: "text",
} as const;
