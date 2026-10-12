/** @generated from stream.videos.captions.language.upload */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/captions/${request.language}`,
	pathParams: ["account_id", "identifier", "language"],
	body: "form",
} as const;
